/**
 * Reference agronomic targets used to interpret the model output.
 *
 * IMPORTANT — where these numbers come from:
 * The cloned repository (and its .pkl models) only predicts raw soil
 * property values from the image — P (available phosphorus, kg/ha),
 * pH, OM (%), and EC (dS/m). It does NOT contain any crop-specific
 * "ideal value" table. Those targets below are general agronomic
 * reference ranges commonly used in Indian soil-health-card style
 * interpretation (Olsen-P sufficiency bands, standard pH/EC/OM
 * classes) and typical extension-recommended available-P levels per
 * crop. They are reasonable defaults for a student/demo project,
 * NOT laboratory-calibrated numbers for any specific field. Treat
 * them as placeholders you can swap for values from your local
 * Krishi Vigyan Kendra / soil testing lab / agronomist.
 */

// Generic sufficiency bands for available Phosphorus (Olsen-P, kg/ha)
// Low / Medium / High — used across most Indian soil health cards.
export const P_BANDS = {
  low: { max: 11, label: "Low" },
  medium: { min: 11, max: 22, label: "Medium" },
  high: { min: 22, label: "High" },
};

// Ideal / target available Phosphorus (kg/ha) per crop, plus
// healthy reference ranges for pH, Organic Matter (%) and EC (dS/m).
// These are the numbers the dashboard compares the model output against.
export const CROP_TARGETS = {
  Rice: {
    idealP: 25,
    pHRange: [5.5, 6.5],
    omRange: [1.5, 3.0],
    ecMax: 2.0,
    note: "Rice tolerates slightly acidic, waterlogged soils better than most cereals.",
  },
  Wheat: {
    idealP: 22,
    pHRange: [6.0, 7.5],
    omRange: [1.5, 3.0],
    ecMax: 1.5,
    note: "Wheat performs best in neutral pH loam soils with good drainage.",
  },
  Maize: {
    idealP: 25,
    pHRange: [5.8, 7.0],
    omRange: [2.0, 3.5],
    ecMax: 1.7,
    note: "Maize is a heavy feeder and responds strongly to balanced P and organic matter.",
  },
  Tomato: {
    idealP: 35,
    pHRange: [6.0, 6.8],
    omRange: [2.5, 4.0],
    ecMax: 2.5,
    note: "Tomato needs higher available P for strong root and fruit development.",
  },
  Potato: {
    idealP: 40,
    pHRange: [5.0, 6.0],
    omRange: [2.5, 4.0],
    ecMax: 2.0,
    note: "Potato prefers slightly acidic soil and is very responsive to phosphorus at tuber initiation.",
  },
  Cotton: {
    idealP: 20,
    pHRange: [6.0, 8.0],
    omRange: [1.0, 2.5],
    ecMax: 4.0,
    note: "Cotton is comparatively tolerant of higher salinity (EC) than most row crops.",
  },
};

export const CROPS = Object.keys(CROP_TARGETS);

/**
 * Compares the model's phosphorus output against the crop's ideal
 * target and returns a structured verdict the UI can render.
 */
export function evaluatePhosphorus(pValue, crop) {
  if (pValue === null || pValue === undefined || Number.isNaN(pValue)) {
    return null;
  }
  const target = CROP_TARGETS[crop];
  if (!target) return null;

  const idealP = target.idealP;
  const deficit = +(idealP - pValue).toFixed(1);
  const sufficient = pValue >= idealP;

  let band = P_BANDS.high.label;
  if (pValue < P_BANDS.low.max) band = P_BANDS.low.label;
  else if (pValue <= P_BANDS.medium.max) band = P_BANDS.medium.label;

  return {
    value: pValue,
    idealP,
    band,
    sufficient,
    deficitKgPerHa: sufficient ? 0 : deficit,
    recommendation: sufficient
      ? `For ${crop}, the soil phosphorus level is ${pValue} kg/ha, which meets or exceeds the target of ${idealP} kg/ha. No additional phosphorus is required at this time.`
      : `For ${crop}, the soil phosphorus level is ${pValue} kg/ha. Target is ${idealP} kg/ha. Add approximately ${deficit} kg/ha phosphorus.`,
  };
}

/**
 * Compares pH, OM and EC against the crop's healthy reference range.
 * Returns a small array of { label, status, message } entries for display.
 */
export function evaluateSoilProperties(soilProperties, crop) {
  const target = CROP_TARGETS[crop];
  if (!target || !soilProperties) return [];

  const results = [];

  if (typeof soilProperties.pH === "number") {
    const [lo, hi] = target.pHRange;
    const inRange = soilProperties.pH >= lo && soilProperties.pH <= hi;
    results.push({
      label: "pH",
      value: soilProperties.pH,
      status: inRange ? "good" : "warn",
      message: inRange
        ? `Within the ideal range for ${crop} (${lo}–${hi}).`
        : `Outside the ideal range for ${crop} (${lo}–${hi}).`,
    });
  }

  if (typeof soilProperties.OM === "number") {
    const [lo, hi] = target.omRange;
    const inRange = soilProperties.OM >= lo && soilProperties.OM <= hi;
    results.push({
      label: "Organic Matter",
      value: soilProperties.OM,
      status: inRange ? "good" : "warn",
      message: inRange
        ? `Healthy organic matter level for ${crop} (${lo}–${hi}%).`
        : `Consider adding compost/FYM — ideal range for ${crop} is ${lo}–${hi}%.`,
    });
  }

  if (typeof soilProperties.EC === "number") {
    const ok = soilProperties.EC <= target.ecMax;
    results.push({
      label: "EC (Salinity)",
      value: soilProperties.EC,
      status: ok ? "good" : "warn",
      message: ok
        ? `Salinity is within a safe range for ${crop} (≤ ${target.ecMax} dS/m).`
        : `Salinity may stress ${crop} — safe threshold is ≤ ${target.ecMax} dS/m.`,
    });
  }

  return results;
}

/**
 * Converts an elemental Phosphorus deficit (kg/ha) into how much of each
 * common phosphate fertilizer product a farmer would actually need to buy
 * and apply, using standard P -> P2O5 conversion (x 2.29) and each
 * product's %P2O5 content.
 *
 * These are standard agronomic conversion factors, not brand-specific
 * advice. Actual application should follow local extension/agronomist
 * guidance, since soil pH, existing N/K levels, and crop stage also affect
 * which product is the better choice in a given field.
 */
export const P_FERTILIZERS = [
  {
    name: "DAP (Di-Ammonium Phosphate)",
    formula: "18-46-0",
    p2o5Percent: 46,
    note: "Also supplies 18% Nitrogen — good general-purpose basal dose choice.",
  },
  {
    name: "TSP (Triple Super Phosphate)",
    formula: "0-46-0",
    p2o5Percent: 46,
    note: "Pure phosphate, no nitrogen — use when nitrogen is already sufficient.",
  },
  {
    name: "SSP (Single Super Phosphate)",
    formula: "0-16-0",
    p2o5Percent: 16,
    note: "Lower concentration but adds sulfur and calcium — often cheaper per bag, more bulk needed.",
  },
];

export function getFertilizerRecommendations(pEval) {
  if (!pEval || pEval.sufficient || !pEval.deficitKgPerHa) return [];

  const p2o5NeededKgPerHa = +(pEval.deficitKgPerHa * 2.29).toFixed(1);

  return P_FERTILIZERS.map((fert) => ({
    ...fert,
    kgPerHa: +(p2o5NeededKgPerHa / (fert.p2o5Percent / 100)).toFixed(1),
    p2o5NeededKgPerHa,
  }));
}
