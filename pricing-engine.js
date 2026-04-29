// ── Worldline Terminal Pricing Engine v3 ─────────────────────────────────────
//
// Four-component scoring:
//   costScore          × 0.35  — relative monthly cost (lower = better)
//   suitabilityScore   × 0.35  — printer / mobility / payment-channel fit
//   performanceScore   × 0.20  — transaction volume tier fit
//   businessTypeFit    × 0.10  — business-type primary/alternative/other
//
// Post-score adjustments applied before final ranking:
//   Meal voucher: EX4000+3, Saturn+3, Tap−3, Link−1
//   Premium (avgSpend≥250): Saturn+2, EX4000+1
//   Budget (avgSpend<30 && txn<1000): Tap+2, Link+1
//
// Key contract truth: Link/2500, EX4000, and Saturn share the SAME pricing
// profile. Monthly cost differences are driven ONLY by hardware amortisation:
//   Tap  €0 / Link €6.21 / EX4000 €9.92 / Saturn €20.79 per month

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
// BUSINESS TYPE RECOMMENDATIONS
// ─────────────────────────────────────────────────────────────────────────────

const BUSINESS_TYPE_RECOMMENDATIONS = {
  bar_lounge_nightlife:     { label: 'Bar / Lounge / Nightlife',                  primary: 'saturn-1000f2', alternative: 'ex4000',        rationale: 'High peak transaction volume and need for reliable checkout performance.' },
  barber_hairdresser:       { label: 'Barber / Hairdresser',                      primary: 'tap-on-mobile', alternative: 'link-2500',      rationale: 'Lower transaction volume; simple mobile acceptance is usually sufficient.' },
  beauty_salon:             { label: 'Beauty Salon',                              primary: 'tap-on-mobile', alternative: 'link-2500',      rationale: 'Typically lower volume and appointment-based payments.' },
  restaurant_full_service:  { label: 'Restaurant / Full Service',                 primary: 'saturn-1000f2', alternative: 'ex4000',        rationale: 'Higher transaction flow, table service, and receipt needs.' },
  fast_food_qsr:            { label: 'Fast Food / QSR',                           primary: 'saturn-1000f2', alternative: 'ex4000',        rationale: 'High throughput and speed are important.' },
  food_truck_popup_food:    { label: 'Food Truck / Popup Food',                   primary: 'ex4000',        alternative: 'saturn-1000f2', rationale: 'Needs mobility plus stronger performance than Tap on Mobile; may need meal voucher support.' },
  catering:                 { label: 'Catering',                                  primary: 'ex4000',        alternative: 'link-2500',      rationale: 'Mobile/off-site payments with moderate volume.' },
  retail_general:           { label: 'Retail Store / General',                    primary: 'ex4000',        alternative: 'link-2500',      rationale: 'Balanced option for store-based payments.' },
  souvenir_shop:            { label: 'Souvenir Shop',                             primary: 'link-2500',     alternative: 'ex4000',         rationale: 'Lower-to-medium volume retail where a lower-cost terminal is suitable.' },
  luxury_retail:            { label: 'Luxury Retail / Jewellery / Watches',       primary: 'saturn-1000f2', alternative: 'ex4000',        rationale: 'Higher average transaction value and more premium checkout experience.' },
  fashion_retail:           { label: 'Clothing / Fashion Retail',                 primary: 'ex4000',        alternative: 'link-2500',      rationale: 'Moderate retail volume and need for flexible checkout.' },
  automotive_services:      { label: 'Automotive Services',                       primary: 'ex4000',        alternative: 'saturn-1000f2', rationale: 'Higher ticket values and potentially more complex payments.' },
  health_practitioners:     { label: 'Health Practitioners / Doctors / Dentists', primary: 'link-2500',     alternative: 'ex4000',         rationale: 'Lower transaction frequency but reliable in-person payments needed.' },
  professional_services:    { label: 'Accounting / Professional Services',        primary: 'tap-on-mobile', alternative: 'link-2500',      rationale: 'Low transaction volume and occasional payments.' },
  advertising_agencies:     { label: 'Advertising / Agencies',                    primary: 'tap-on-mobile', alternative: 'link-2500',      rationale: 'Low card-present transaction volume.' },
  agricultural_cooperative: { label: 'Agricultural / Cooperative',                primary: 'link-2500',     alternative: 'tap-on-mobile',  rationale: 'Practical low-cost terminal for occasional physical payments.' },
  airlines_travel:          { label: 'Airlines / Travel Services',                primary: 'saturn-1000f2', alternative: 'ex4000',        rationale: 'Higher transaction value and need for reliable payment handling.' },
  amusement_entertainment:  { label: 'Amusement Parks / Entertainment',           primary: 'saturn-1000f2', alternative: 'ex4000',        rationale: 'High peak volume and fast checkout requirements.' },
  clubs_memberships:        { label: 'Clubs / Membership Organisations',          primary: 'ex4000',        alternative: 'saturn-1000f2', rationale: 'Moderate-to-high volume with flexibility needs.' },
  repair_alterations:       { label: 'Repair / Alterations',                      primary: 'link-2500',     alternative: 'tap-on-mobile',  rationale: 'Lower volume, practical terminal use case.' },
};

// ─────────────────────────────────────────────────────────────────────────────
// BUSINESS TYPE DETECTION
// ─────────────────────────────────────────────────────────────────────────────

function detectBusinessType(text) {
  if (!text) return null;
  const t = text.toLowerCase();

  if (/barber|hairdresser|hair\s*dresser|kapper/.test(t))                          return 'barber_hairdresser';
  if (/beauty\s*salon|nail\s*(salon|bar)|esthetici|schoonheids/.test(t))           return 'beauty_salon';
  if (/salon|spa\b/.test(t))                                                       return 'beauty_salon';
  if (/bar\b|lounge|nightclub|night\s*club|nightlife/.test(t))                     return 'bar_lounge_nightlife';
  if (/food\s*truck|foodtruck|pop\s*up\s*food|popup\s*food/.test(t))              return 'food_truck_popup_food';
  if (/fast\s*food|takeaway|takeout|snackbar|burger|kebab|pizza|qsr/.test(t))      return 'fast_food_qsr';
  if (/caf[eé]|coffee|espresso|barista|latte/.test(t))                             return 'fast_food_qsr';
  if (/restaurant|bistro|brasserie|eatery|diner|dining/.test(t))                   return 'restaurant_full_service';
  if (/catering|caterer/.test(t))                                                  return 'catering';
  if (/jewel|jewelry|jewellery|watch(es)?|horlog/.test(t))                         return 'luxury_retail';
  if (/luxury|premium\s*retail|high[- ]end/.test(t))                               return 'luxury_retail';
  if (/fashion|clothing|apparel|clothes|garment/.test(t))                          return 'fashion_retail';
  if (/souvenir|tourist\s*shop|gift\s*shop/.test(t))                               return 'souvenir_shop';
  if (/boutique/.test(t))                                                           return 'fashion_retail';
  if (/automotive|garage|car\s*repair|auto\s*mechanic|workshop/.test(t))           return 'automotive_services';
  if (/doctor|dentist|clinic|medical|practitioner|\bgp\b|physician|pharmacy|apotheek/.test(t)) return 'health_practitioners';
  if (/accounti|consulting|consultant|notary|notaris/.test(t))                     return 'professional_services';
  if (/advertis|marketing\s*agency|agencies/.test(t))                              return 'advertising_agencies';
  if (/farm|agricultural|cooperative|co[oö]peratie/.test(t))                       return 'agricultural_cooperative';
  if (/airline|travel\s*agent|travel\s*service|hotel|accommodation/.test(t))       return 'airlines_travel';
  if (/amusement|theme\s*park|cinema|escape\s*room/.test(t))                       return 'amusement_entertainment';
  if (/\bclub\b|membership|gym|fitness|sport|yoga|pilates/.test(t))                return 'clubs_memberships';
  if (/repair|alteration|tailor|cobbler|locksmith/.test(t))                        return 'repair_alterations';
  if (/retail|shop|store|winkel|bakery|bakker|florist|flower/.test(t))             return 'retail_general';

  return null;
}

// ─────────────────────────────────────────────────────────────────────────────
// PERFORMANCE FIT TABLE
// ─────────────────────────────────────────────────────────────────────────────

const PERFORMANCE_FIT = {
  'tap-on-mobile': { low: 10, medium: 6, high: 3, very_high: 1 },
  'link-2500':     { low: 9,  medium: 8, high: 5, very_high: 3 },
  'ex4000':        { low: 7,  medium: 9, high: 9, very_high: 7 },
  'saturn-1000f2': { low: 5,  medium: 7, high: 9, very_high: 10 },
};

function getPerformanceTier(monthlyTransactions) {
  if (monthlyTransactions < 1000)  return 'low';
  if (monthlyTransactions < 5000)  return 'medium';
  if (monthlyTransactions < 10000) return 'high';
  return 'very_high';
}

function getBusinessTypeFitScore(productId, bizType, txn) {
  if (!bizType || !BUSINESS_TYPE_RECOMMENDATIONS[bizType]) return 4;
  const rec = BUSINESS_TYPE_RECOMMENDATIONS[bizType];
  if (rec.primary === productId) return 10;

  // Food Truck: alternative depends on monthly transaction volume
  // Spreadsheet rule: >600 txn → Saturn 1000F2, ≤600 txn → Link/2500
  if (bizType === 'food_truck_popup_food') {
    const alt = (txn || 0) > 600 ? 'saturn-1000f2' : 'link-2500';
    return productId === alt ? 7 : 4;
  }

  if (rec.alternative === productId) return 7;
  return 4;
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYMENT MIX
// ─────────────────────────────────────────────────────────────────────────────

function defaultPaymentMix(avgSpend) {
  if (avgSpend <= 5)  return { debitBelowOrEqual5: 0.70, debitAbove5: 0.10, visaMastercard: 0.15, alternativeCards: 0.05 };
  if (avgSpend <= 15) return { debitBelowOrEqual5: 0.10, debitAbove5: 0.50, visaMastercard: 0.30, alternativeCards: 0.10 };
  if (avgSpend <= 40) return { debitBelowOrEqual5: 0.00, debitAbove5: 0.45, visaMastercard: 0.40, alternativeCards: 0.15 };
  return               { debitBelowOrEqual5: 0.00, debitAbove5: 0.25, visaMastercard: 0.55, alternativeCards: 0.20 };
}

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
  const monthlyVolume  = txn * spend;
  const surchargeShare = Math.max(commercialCardShare, nonEEAShare);
  const surcharges     = monthlyVolume * surchargeShare * profile.surcharges.commercial;

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

function calculateTotalMonthlyCost(productId, merchantInputs) {
  const r = calculateCostBreakdown(productId, merchantInputs);
  return r ? r.total : Infinity;
}

// ─────────────────────────────────────────────────────────────────────────────
// SUITABILITY ENGINE  (printer / mobility / payment channel)
// ─────────────────────────────────────────────────────────────────────────────
//
// Volume and throughput signals have moved to performanceScore.
// Transaction value premium is handled as a post-score adjustment.

function calculateSuitability(productId, answers) {
  const { needsPrinter, businessTypes, paymentMethods } = answers;
  const isPhysical    = businessTypes.includes('physical');
  const isPopup       = businessTypes.includes('popup');
  const wantsTerminal = paymentMethods.includes('terminal');

  // Base: innate mobility / form-factor score
  let score = { 'tap-on-mobile': 6, 'link-2500': 5, 'ex4000': 4, 'saturn-1000f2': 3 }[productId] ?? 3;

  // ── Printer ──────────────────────────────────────────────────────────────
  if (needsPrinter) {
    if (productId === 'ex4000')        score += 3;  // built-in printer
    if (productId === 'saturn-1000f2') score += 3;  // high-speed built-in printer
    if (productId === 'link-2500')     score += 1;  // can pair with Bluetooth printer
    if (productId === 'tap-on-mobile') score -= 2;  // no print option
  } else {
    if (productId === 'tap-on-mobile') score += 1;  // lightweight setup rewarded
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
// EXPLANATION GENERATOR
// ─────────────────────────────────────────────────────────────────────────────

function generateExplanation(recommendedId, altId, answers, tier, detectedBizType) {
  const NAMES = {
    'tap-on-mobile': 'Tap on Mobile',
    'link-2500':     'Link/2500',
    'ex4000':        'EX4000',
    'saturn-1000f2': 'Saturn 1000F2',
  };

  const recName = NAMES[recommendedId];
  const altName = NAMES[altId];
  const bizRec  = detectedBizType ? BUSINESS_TYPE_RECOMMENDATIONS[detectedBizType] : null;
  const lines   = [];

  // Primary recommendation reason
  if (bizRec) {
    lines.push(`${recName} is recommended for ${bizRec.label} businesses — ${bizRec.rationale.replace(/\.$/, '').toLowerCase()}.`);
  } else {
    lines.push(`${recName} is your best match based on your transaction volume, business setup, and cost profile.`);
  }

  // Performance context
  const tierLabel = { low: 'low', medium: 'moderate', high: 'high', very_high: 'very high' }[tier] || tier;
  lines.push(`With ${tierLabel} monthly transaction volume, this terminal offers the right balance of performance and running cost.`);

  // Printer note
  if (answers.needsPrinter) {
    if (recommendedId === 'ex4000' || recommendedId === 'saturn-1000f2') {
      lines.push(`It includes a built-in receipt printer to match your requirement.`);
    } else if (recommendedId === 'link-2500') {
      lines.push(`It can pair with a Bluetooth printer for receipt printing.`);
    }
  }

  // Meal voucher note
  if (answers.needsMealVouchers && (recommendedId === 'ex4000' || recommendedId === 'saturn-1000f2')) {
    lines.push(`It supports meal vouchers — important for your business type.`);
  }

  // Premium note
  if ((answers.avgSpend || 0) >= 250 && recommendedId === 'saturn-1000f2') {
    lines.push(`The premium countertop design fits the high-value transactions your customers expect.`);
  }

  // Alternative reason
  if (bizRec && bizRec.alternative === altId) {
    lines.push(`${altName} is the recommended alternative — offering a good balance of capability and flexibility for your profile.`);
  } else {
    lines.push(`${altName} is a strong alternative with a slightly different cost and feature balance.`);
  }

  return lines;
}

// ─────────────────────────────────────────────────────────────────────────────
// COMBINED SCORING  (costScore×0.35 + suitability×0.35 + performance×0.20 + bizFit×0.10)
// ─────────────────────────────────────────────────────────────────────────────

function getTerminalRecommendation(answers, merchantInputs) {
  const IDS = ['tap-on-mobile', 'link-2500', 'ex4000', 'saturn-1000f2'];
  const { transactions: txn, avgSpend, detectedBusinessType, needsMealVouchers } = answers;

  // Cost
  const costs = {}, breakdowns = {};
  IDS.forEach(id => {
    const r = calculateCostBreakdown(id, merchantInputs);
    costs[id]      = r.total;
    breakdowns[id] = r;
  });
  const maxCost   = Math.max(...Object.values(costs));
  const minCost   = Math.min(...Object.values(costs));
  const costRange = (maxCost - minCost) || 1;

  // Suitability
  const suitability = {};
  IDS.forEach(id => { suitability[id] = calculateSuitability(id, answers); });

  // Performance tier
  const tier = getPerformanceTier(txn || 0);
  const performance = {};
  IDS.forEach(id => { performance[id] = PERFORMANCE_FIT[id][tier]; });

  // Business type fit
  const bizFit = {};
  IDS.forEach(id => { bizFit[id] = getBusinessTypeFitScore(id, detectedBusinessType, txn); });

  // Combined scores with adjustments
  const finalScores = {};
  IDS.forEach(id => {
    const costScore = ((maxCost - costs[id]) / costRange) * 10;
    const s = Math.min(10, Math.max(0, suitability[id]));

    const base = costScore * 0.35 + s * 0.35 + performance[id] * 0.20 + bizFit[id] * 0.10;

    // Post-score adjustments (applied additively, same pattern as meal vouchers)
    let adj = 0;

    // Premium / high-ticket: luxury clients expect professional hardware
    // Applied as a direct finalScore boost/penalty so it overrides the performance
    // advantage that Tap on Mobile otherwise holds at low monthly volume.
    if ((avgSpend || 0) >= 250) {
      if (id === 'saturn-1000f2') adj += 3;
      if (id === 'ex4000')        adj += 1;
      if (id === 'tap-on-mobile') adj -= 4;
      if (id === 'link-2500')     adj -= 2;
    } else if ((avgSpend || 0) < 30 && (txn || 0) < 1000) {
      // Budget / very-low-volume: lightweight setup is the right fit
      if (id === 'tap-on-mobile') adj += 2;
      if (id === 'link-2500')     adj += 1;
    }

    // Very high volume: at ≥10 000 txn/month hardware cost is a tiny fraction of
    // total spend, but the normalized costScore still penalises Saturn heavily.
    // This boost reflects Saturn's throughput leadership at scale.
    if ((txn || 0) >= 10000) {
      if (id === 'saturn-1000f2') adj += 1.5;
      if (id === 'tap-on-mobile') adj -= 1.5;
    }

    // Food Truck volume rule (from spreadsheet):
    // >600 txn/month → Saturn 1000F2 is the alternative
    // ≤600 txn/month → Link/2500 is the alternative
    // Saturn's popup suitability penalty means it needs an explicit boost
    // to reflect its superiority over Link at higher food-truck volumes.
    if (detectedBusinessType === 'food_truck_popup_food') {
      if ((txn || 0) > 600) {
        if (id === 'saturn-1000f2') adj += 3;
        if (id === 'link-2500')     adj -= 2;
      }
    }

    // Meal voucher support
    if (needsMealVouchers) {
      if (id === 'ex4000')        adj += 3;
      if (id === 'saturn-1000f2') adj += 3;
      if (id === 'tap-on-mobile') adj -= 3;
      if (id === 'link-2500')     adj -= 1;
    }

    finalScores[id] = base + adj;
  });

  const ranked   = IDS.slice().sort((a, b) => finalScores[b] - finalScores[a]);
  const cheapest = IDS.slice().sort((a, b) => costs[a] - costs[b])[0];

  const explanation = generateExplanation(
    ranked[0], ranked[1], answers, tier, detectedBusinessType || null
  );

  return {
    recommended: ranked[0],
    alternative: ranked[1],
    cheapest,
    ranked,
    costs,
    breakdowns,
    suitability,
    finalScores,
    explanation,
  };
}
