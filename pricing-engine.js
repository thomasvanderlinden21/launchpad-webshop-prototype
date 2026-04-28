// ── Worldline Terminal Pricing Engine v2 ─────────────────────────────────────
//
// Clean separation of concerns:
//   Cost engine    — objective, contract-accurate, same rates for all terminals
//   Suitability    — subjective fit score (0–10)
//   Combined score — suitability × 0.8  +  costScore × 0.2
//
// Key contract truth: Link/2500, EX4000, and Saturn share the SAME pricing
// profile. Monthly cost differences are driven ONLY by hardware amortisation:
//   Tap  €0 / Link €6.21 / EX4000 €9.92 / Saturn €20.79 per month
//
// EX4000 vs Saturn ≈ €10–11 / month — NOT hundreds.
//
// Suitability factors (in order of weight):
//   1. Transaction value  — high avg spend signals premium hardware preference
//   2. Volume + throughput — monthly txn and estimated peak txn/hour
//   3. Printer need        — EX4000 / Saturn have built-in printers
//   4. Business type       — physical countertop vs popup/mobile
//   5. Payment channel     — terminal vs pay-by-link vs online

// ─────────────────────────────────────────────────────────────────────────────
// PRICING PROFILES
// ─────────────────────────────────────────────────────────────────────────────

const PRICING_PROFILES = {
  standard: {
    rates: {
      visaMastercard:     { type: 'percent', rate: 0.011  },   // 1.10 %
      debitBelowOrEqual5: { type: 'fixed',   fee:  0.038  },   // €0.038 flat
      debitAbove5:        { type: 'fixed',   fee:  0.115  },   // €0.115 flat
      alternativeCards:   { type: 'percent', rate: 0.0265 },   // 2.65 %
    },
    // Minimum REPLACES lower fee — does not add on top
    minimumFeePerTransaction: 0.15,
    // Surcharges — NOT cumulative: apply max(commercialShare, nonEEAShare)
    surcharges: {
      commercial: 0.012,   // +1.20 %
      nonEEA:     0.012,   // +1.20 %
    },
    chargebackFee:       30,   // € per event
    complianceAnnualFee: 60,   // €60 / year → €5 / month
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DEVICE PROFILES
// ─────────────────────────────────────────────────────────────────────────────

const DEVICE_PROFILES = {
  'tap-on-mobile': { hardwareCost:   0, amortisationMonths: 24, pricingProfile: 'standard', deviceMonthlyFee: 0 },
  'link-2500':     { hardwareCost: 149, amortisationMonths: 24, pricingProfile: 'standard', deviceMonthlyFee: 0 },
  'ex4000':        { hardwareCost: 238, amortisationMonths: 24, pricingProfile: 'standard', deviceMonthlyFee: 0 },
  'saturn-1000f2': { hardwareCost: 499, amortisationMonths: 24, pricingProfile: 'standard', deviceMonthlyFee: 0 },
};

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT MIX
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Derive a realistic card-type split from average transaction value.
 * Higher spend → more credit / alternative cards.
 */
function defaultPaymentMix(avgSpend) {
  if (avgSpend <= 5)  return { debitBelowOrEqual5: 0.70, debitAbove5: 0.10, visaMastercard: 0.15, alternativeCards: 0.05 };
  if (avgSpend <= 15) return { debitBelowOrEqual5: 0.10, debitAbove5: 0.50, visaMastercard: 0.30, alternativeCards: 0.10 };
  if (avgSpend <= 40) return { debitBelowOrEqual5: 0.00, debitAbove5: 0.45, visaMastercard: 0.40, alternativeCards: 0.15 };
  return               { debitBelowOrEqual5: 0.00, debitAbove5: 0.25, visaMastercard: 0.55, alternativeCards: 0.20 };
}

/** Build full merchant inputs from the two finder slider values. */
function merchantInputsFromFinderAnswers(txn, avgSpend) {
  return {
    monthlyTransactions: txn,
    avgTransactionValue: avgSpend,
    paymentMix:          defaultPaymentMix(avgSpend),
    commercialCardShare: 0.20,   // 20 % assumed corporate/business cards
    nonEEAShare:         0.05,   // 5 % assumed non-EEA issued cards
    chargebackRate:      0.001,  // 0.1 % of transactions → chargeback
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// COST ENGINE  (objective)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Full cost breakdown for one product.
 * Returns { total, breakdown, pricingProfile }.
 */
function calculateCostBreakdown(productId, merchantInputs) {
  const device = DEVICE_PROFILES[productId];
  if (!device) return null;

  const profile = PRICING_PROFILES[device.pricingProfile];
  const { monthlyTransactions: txn, avgTransactionValue: spend,
          paymentMix: mix, commercialCardShare, nonEEAShare, chargebackRate } = merchantInputs;

  // Helper: minimum fee replaces, does not add
  function effectiveFee(rateEntry) {
    const raw = rateEntry.type === 'percent' ? spend * rateEntry.rate : rateEntry.fee;
    return Math.max(raw, profile.minimumFeePerTransaction);
  }

  // 1. Hardware amortisation
  const hardware = device.hardwareCost / device.amortisationMonths;

  // 2. Transaction fees — identical for all products on the same profile
  const vmPerTxn    = effectiveFee(profile.rates.visaMastercard);
  const dbLowPerTxn = effectiveFee(profile.rates.debitBelowOrEqual5);
  const dbHiPerTxn  = effectiveFee(profile.rates.debitAbove5);
  const altPerTxn   = effectiveFee(profile.rates.alternativeCards);

  const transactions =
    (mix.visaMastercard     || 0) * txn * vmPerTxn    +
    (mix.debitBelowOrEqual5 || 0) * txn * dbLowPerTxn +
    (mix.debitAbove5        || 0) * txn * dbHiPerTxn  +
    (mix.alternativeCards   || 0) * txn * altPerTxn;

  // 3. Surcharges — non-cumulative
  const monthlyVolume = txn * spend;
  const surchargeShare = Math.max(commercialCardShare, nonEEAShare);
  const surcharges = monthlyVolume * surchargeShare * profile.surcharges.commercial;

  // 4. Chargebacks
  const chargebacks = txn * chargebackRate * profile.chargebackFee;

  // 5. Compliance
  const compliance = profile.complianceAnnualFee / 12;

  // 6. Device fee (e.g. SIM, service plan)
  const deviceFee = device.deviceMonthlyFee;

  const total = hardware + transactions + surcharges + chargebacks + compliance + deviceFee;

  return {
    total,
    breakdown: { hardware, transactions, surcharges, chargebacks, compliance, deviceFee },
    pricingProfile: device.pricingProfile,
  };
}

/** Convenience wrapper — returns total cost only. */
function calculateTotalMonthlyCost(productId, merchantInputs) {
  const r = calculateCostBreakdown(productId, merchantInputs);
  return r ? r.total : Infinity;
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITABILITY ENGINE  (subjective, 0–10)
// ─────────────────────────────────────────────────────────────────────────────
//
// Rules:
//  • Link must NEVER be unfairly penalised — it is a valid contender at all
//    volumes when printer is not required, and still competitive when it is.
//  • Adjustments are additive from a mobility base score.
//  • Final score is clamped to [0, 10].

function calculateSuitability(productId, answers) {
  const { transactions: txn, needsPrinter, businessTypes, paymentMethods, avgSpend } = answers;
  const avgSpendVal   = avgSpend || 50;
  const isPhysical    = businessTypes.includes('physical');
  const isPopup       = businessTypes.includes('popup');
  const wantsTerminal = paymentMethods.includes('terminal');

  // Estimated peak transactions per hour (8-hour operating day, 30-day month).
  // Used to assess whether processing speed is a constraint.
  const txnPerHour = txn / 30 / 8;

  // Base: innate mobility / form-factor score
  let score = { 'tap-on-mobile': 6, 'link-2500': 5, 'ex4000': 4, 'saturn-1000f2': 3 }[productId] ?? 3;

  // ── Printer ──────────────────────────────────────────────────────────────
  if (needsPrinter) {
    if (productId === 'ex4000')        score += 3;  // built-in printer
    if (productId === 'saturn-1000f2') score += 3;  // high-speed built-in printer
    if (productId === 'link-2500')     score += 1;  // can pair with Bluetooth printer
    if (productId === 'tap-on-mobile') score -= 2;  // no print option
  } else {
    if (productId === 'tap-on-mobile') score += 1;  // rewarded for lightweight setup
    if (productId === 'link-2500')     score += 1;
  }

  // ── Business type ─────────────────────────────────────────────────────────
  if (isPhysical && !isPopup) {
    if (productId === 'saturn-1000f2') score += 2;  // purpose-built countertop
  }
  if (isPopup) {
    if (productId === 'link-2500')     score += 3;  // ideal portable for events
    if (productId === 'tap-on-mobile') score += 2;  // zero hardware — go anywhere
    if (productId === 'ex4000')        score += 1;
    if (productId === 'saturn-1000f2') score -= 2;  // countertop, poor fit for popup
  }

  // ── Transaction value — premium / prestige signal ─────────────────────────
  // Higher avg spend correlates with customer expectations of professional,
  // premium-looking hardware. A jeweller's customer expects a Saturn, not a phone app.
  // Low spend + low volume → lightweight setup is the right fit.
  if (avgSpendVal >= 200) {
    // Luxury / high-value transactions (jewellery, premium retail, high-end hospitality)
    if (productId === 'saturn-1000f2') score += 4;  // premium countertop presence
    if (productId === 'ex4000')        score += 2;  // professional portable
    if (productId === 'tap-on-mobile') score -= 3;  // poor fit for luxury clients
    if (productId === 'link-2500')     score -= 2;  // underwhelming for high-value sales
  } else if (avgSpendVal >= 80) {
    // Moderately high spend — capable, professional hardware preferred
    if (productId === 'saturn-1000f2') score += 2;
    if (productId === 'ex4000')        score += 1;
    if (productId === 'tap-on-mobile') score -= 1;
  }

  // ── Volume — monthly baseline ─────────────────────────────────────────────
  if (txn >= 10000) {
    // Very high volume: Saturn's throughput and reliability are critical
    if (productId === 'saturn-1000f2') score += 5;
    if (productId === 'ex4000')        score += 2;
    if (productId === 'tap-on-mobile') score -= 3;
    if (productId === 'link-2500')     score -= 1;
  } else if (txn >= 3000) {
    if (productId === 'ex4000')        score += 3;
    if (productId === 'link-2500')     score += 1;
    if (productId === 'saturn-1000f2') score += 1;
  } else if (txn < 500) {
    if (avgSpendVal < 50) {
      // Low volume AND low spend — ultra-lightweight is ideal (e.g. hairdresser, market stall)
      if (productId === 'tap-on-mobile') score += 3;
      if (productId === 'link-2500')     score += 2;
    } else {
      // Low volume but meaningful spend — nudge toward more capable hardware
      if (productId === 'tap-on-mobile') score += 1;
      if (productId === 'link-2500')     score += 2;
      if (productId === 'ex4000')        score += 1;
    }
  }

  // ── Throughput — peak processing demand ──────────────────────────────────
  // Monthly volume tells one story; peak txn/hour tells another.
  // A busy lunch service or market stall needs hardware that won't queue up.
  if (txnPerHour >= 20) {
    // Sustained high throughput — fast, reliable hardware is non-negotiable
    if (productId === 'saturn-1000f2') score += 2;
    if (productId === 'ex4000')        score += 1;
    if (productId === 'tap-on-mobile') score -= 2;
  } else if (txnPerHour >= 10) {
    // Moderate-high throughput — EX4000 starts to outperform basic mobile
    if (productId === 'ex4000')        score += 1;
  } else if (txnPerHour < 3) {
    // Low peak rate — mobile solutions are more than sufficient
    if (productId === 'tap-on-mobile') score += 1;
    if (productId === 'link-2500')     score += 1;
  }

  // ── High-volume popup — professional portable over basic mobile ───────────
  // At market stalls / food trucks with >3 000 txn/month, throughput and
  // battery endurance make EX4000 the better choice over Link.
  if (isPopup && txn >= 3000) {
    if (productId === 'ex4000')    score += 2;
    if (productId === 'link-2500') score -= 1;
  }

  // ── Payment channel ───────────────────────────────────────────────────────
  if (!wantsTerminal) {
    if (productId === 'tap-on-mobile') score += 2;  // digital-first fits
    if (productId === 'link-2500')     score -= 1;
    if (productId === 'ex4000')        score -= 2;
    if (productId === 'saturn-1000f2') score -= 3;
  }

  return Math.min(10, Math.max(0, score));
}

// ─────────────────────────────────────────────────────────────────────────────
// COMBINED SCORING  (suitability × 0.8  +  costScore × 0.2)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Full recommendation engine.
 *
 * Returns:
 *   recommended  — productId with highest finalScore
 *   alternative  — productId with second-highest finalScore
 *   cheapest     — productId with lowest totalMonthlyCost
 *   ranked       — all IDs sorted by finalScore descending
 *   costs        — { productId: totalMonthlyCost }
 *   breakdowns   — { productId: { total, breakdown, pricingProfile } }
 *   suitability  — { productId: 0–10 score }
 *   finalScores  — { productId: combined score }
 */
function getTerminalRecommendation(answers, merchantInputs) {
  const IDS = ['tap-on-mobile', 'link-2500', 'ex4000', 'saturn-1000f2'];

  // Cost
  const costs = {}, breakdowns = {};
  IDS.forEach(id => {
    const r = calculateCostBreakdown(id, merchantInputs);
    costs[id] = r.total;
    breakdowns[id] = r;
  });
  const maxCost   = Math.max(...Object.values(costs));
  const minCost   = Math.min(...Object.values(costs));
  const costRange = (maxCost - minCost) || 1;

  // Suitability
  const suitability = {};
  IDS.forEach(id => { suitability[id] = calculateSuitability(id, answers); });

  // Combined: suitability is the primary signal; cost breaks ties and reflects value
  const finalScores = {};
  IDS.forEach(id => {
    const costScore  = ((maxCost - costs[id]) / costRange) * 10;
    finalScores[id]  = suitability[id] * 0.8 + costScore * 0.2;
  });

  const ranked      = IDS.slice().sort((a, b) => finalScores[b] - finalScores[a]);
  const cheapest    = IDS.slice().sort((a, b) => costs[a] - costs[b])[0];

  return {
    recommended: ranked[0],
    alternative: ranked[1],
    cheapest,
    ranked,
    costs,
    breakdowns,
    suitability,
    finalScores,
  };
}
