// ── Worldline Terminal Pricing Engine ────────────────────────────────────────
// Based on actual contract rates from the Worldline merchant agreement.
//
// Key insight: all terminal products share the same processing rates.
// The monthly cost difference between products is driven purely by hardware
// amortisation. E.g. EX4000 vs Saturn: (499 − 238) / 24 ≈ €10.88 / month.

const PRICING_PROFILES = {
  standard: {
    // Transaction rate schedules
    visaMastercard:         { type: 'percent', rate: 0.011  },   // 1.10 %
    debitBelowOrEqual5:     { type: 'fixed',   fee:  0.038  },   // €0.038 flat
    debitAbove5:            { type: 'fixed',   fee:  0.115  },   // €0.115 flat
    alternativeCards:       { type: 'percent', rate: 0.0265 },   // 2.65 %
    // Minimum replaces the calculated fee (does not add on top)
    minimumFeePerTransaction: 0.15,
    // Surcharges applied to transaction volume (not cumulative — take max share)
    surcharges: {
      commercialCards: 0.012,   // +1.20 %
      nonEEA:          0.012,   // +1.20 %
      cumulative:      false
    },
    chargebackFee:       30,    // €30 per chargeback event
    complianceAnnualFee: 60     // €60 / year → €5 / month
  }
};

// Hardware acquisition cost and amortisation period per product
const DEVICE_PROFILES = {
  'tap-on-mobile': { hardwareCost: 0,   amortisationMonths: 24, pricingProfile: 'standard' },
  'link-2500':     { hardwareCost: 79,  amortisationMonths: 24, pricingProfile: 'standard' },
  'ex4000':        { hardwareCost: 238, amortisationMonths: 24, pricingProfile: 'standard' },
  'saturn-1000f2': { hardwareCost: 499, amortisationMonths: 24, pricingProfile: 'standard' }
};

// ── Payment mix helpers ───────────────────────────────────────────────────────

/**
 * Derive a typical payment-type breakdown from the average transaction value.
 * Higher-value transactions skew toward credit / alternative cards.
 */
function defaultPaymentMix(avgSpend) {
  if (avgSpend <= 5) {
    // Micro-transactions: coffee shops, vending, parking
    return { debitBelowOrEqual5: 0.70, debitAbove5: 0.10, visaMastercard: 0.15, alternativeCards: 0.05 };
  } else if (avgSpend <= 15) {
    // Low ticket: fast food, convenience
    return { debitBelowOrEqual5: 0.10, debitAbove5: 0.50, visaMastercard: 0.30, alternativeCards: 0.10 };
  } else if (avgSpend <= 40) {
    // Mid ticket: restaurants, retail
    return { debitBelowOrEqual5: 0.00, debitAbove5: 0.45, visaMastercard: 0.40, alternativeCards: 0.15 };
  } else {
    // High ticket: hotels, electronics, luxury
    return { debitBelowOrEqual5: 0.00, debitAbove5: 0.25, visaMastercard: 0.55, alternativeCards: 0.20 };
  }
}

/**
 * Build a full merchantInputs object from the two finder slider values.
 */
function merchantInputsFromFinderAnswers(txn, avgSpend) {
  return {
    monthlyTransactions: txn,
    avgTransactionValue: avgSpend,
    paymentMix:          defaultPaymentMix(avgSpend),
    commercialCardShare: 0.20,   // 20 % assumed business/corporate cards
    nonEEAShare:         0.05,   // 5 % assumed non-EEA issued cards
    chargebackRate:      0.001   // 0.1 % of transactions result in a chargeback
  };
}

// ── Core cost calculator ──────────────────────────────────────────────────────

/**
 * Calculate the total estimated monthly running cost for a given product.
 *
 * @param {string} productId  — one of the DEVICE_PROFILES keys
 * @param {object} merchantInputs — from merchantInputsFromFinderAnswers()
 * @returns {number} estimated monthly cost in euros
 */
function calculateTotalMonthlyCost(productId, merchantInputs) {
  const device = DEVICE_PROFILES[productId];
  if (!device) return Infinity;

  const profile = PRICING_PROFILES[device.pricingProfile];
  const {
    monthlyTransactions:  txn,
    avgTransactionValue:  spend,
    paymentMix:           mix,
    commercialCardShare,
    nonEEAShare,
    chargebackRate
  } = merchantInputs;

  // 1. Hardware amortisation (monthly equivalent)
  const hardwareMonthly = device.hardwareCost / device.amortisationMonths;

  // 2. Transaction fees — apply minimum-fee floor per transaction type
  const minFee = profile.minimumFeePerTransaction;
  let txnFees = 0;

  // Visa / Mastercard — percentage of spend, floored at minimum
  const vmPerTxn = Math.max(spend * profile.visaMastercard.rate, minFee);
  txnFees += (mix.visaMastercard || 0) * txn * vmPerTxn;

  // Debit ≤ €5 — flat fee, floored at minimum
  const dbLowPerTxn = Math.max(profile.debitBelowOrEqual5.fee, minFee);
  txnFees += (mix.debitBelowOrEqual5 || 0) * txn * dbLowPerTxn;

  // Debit > €5 — flat fee, floored at minimum
  const dbHighPerTxn = Math.max(profile.debitAbove5.fee, minFee);
  txnFees += (mix.debitAbove5 || 0) * txn * dbHighPerTxn;

  // Alternative cards (Diners, JCB, UnionPay, wallets) — percentage, floored
  const altPerTxn = Math.max(spend * profile.alternativeCards.rate, minFee);
  txnFees += (mix.alternativeCards || 0) * txn * altPerTxn;

  // 3. Surcharges — non-cumulative: apply the higher of the two surcharge shares
  const monthlyVolume  = txn * spend;
  const surchargeShare = Math.max(commercialCardShare, nonEEAShare);
  const surcharges     = monthlyVolume * surchargeShare * profile.surcharges.commercialCards;

  // 4. Chargebacks
  const chargebackFees = txn * chargebackRate * profile.chargebackFee;

  // 5. Compliance fee (annual, spread evenly)
  const complianceMonthly = profile.complianceAnnualFee / 12;

  return hardwareMonthly + txnFees + surcharges + chargebackFees + complianceMonthly;
}
