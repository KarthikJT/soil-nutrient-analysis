import NutrientCard from "./NutrientCard.jsx";
import {
  evaluatePhosphorus,
  evaluateSoilProperties,
  getFertilizerRecommendations,
  CROP_TARGETS,
} from "../data/cropTargets.js";

export default function ResultsDashboard({ result, crop, imagePreviewUrl }) {
  if (!result) {
    return (
      <section className="card results-panel empty-state">
        <h2>2. Results</h2>
        <p className="hint">
          Upload a soil image, choose a crop, and click "Analyse Soil" to see
          nutrient results and fertilizer guidance here.
        </p>
      </section>
    );
  }

  const { nutrients, soilProperties } = result;
  const pEval = evaluatePhosphorus(nutrients?.P, crop);
  const propertyEvals = evaluateSoilProperties(soilProperties, crop);
  const fertilizerOptions = getFertilizerRecommendations(pEval);
  const target = CROP_TARGETS[crop];

  return (
    <section className="card results-panel">
      <h2>3. Soil Analysis Results</h2>

      <div className="results-summary">
        {imagePreviewUrl && (
          <img src={imagePreviewUrl} alt="Analysed soil sample" className="thumb" />
        )}
        <div>
          <p className="crop-chip">Crop: {crop}</p>
          <p className="hint">{target?.note}</p>
        </div>
      </div>

      <h3>Nutrients</h3>
      <div className="grid nutrients-grid">
        <NutrientCard
          label="Nitrogen (N)"
          unavailable
          hint="No trained N model in the current pipeline"
        />
        <NutrientCard
          label="Phosphorus (P)"
          value={nutrients?.P ?? "—"}
          unit="kg/ha"
        />
        <NutrientCard
          label="Potassium (K)"
          unavailable
          hint="No trained K model in the current pipeline"
        />
      </div>

      <h3>Soil Properties</h3>
      <div className="grid properties-grid">
        <NutrientCard label="pH" value={soilProperties?.pH ?? "—"} />
        <NutrientCard label="Organic Matter" value={soilProperties?.OM ?? "—"} unit="%" />
        <NutrientCard label="EC" value={soilProperties?.EC ?? "—"} unit="dS/m" />
      </div>

      {propertyEvals.length > 0 && (
        <ul className="property-checklist">
          {propertyEvals.map((p) => (
            <li key={p.label} className={p.status}>
              <span className="dot" />
              <strong>{p.label}:</strong> {p.message}
            </li>
          ))}
        </ul>
      )}

      <h3>Phosphorus vs. Crop Target</h3>
      {pEval ? (
        <div className={`recommendation-box ${pEval.sufficient ? "good" : "warn"}`}>
          <div className="p-compare-row">
            <div>
              <span className="compare-label">Current</span>
              <span className="compare-value">{pEval.value} kg/ha</span>
            </div>
            <div>
              <span className="compare-label">Target ({crop})</span>
              <span className="compare-value">{pEval.idealP} kg/ha</span>
            </div>
            <div>
              <span className="compare-label">Status</span>
              <span className="compare-value">
                {pEval.sufficient ? "Sufficient ✅" : `Deficient (${pEval.band})`}
              </span>
            </div>
          </div>
          <p className="recommendation-text">{pEval.recommendation}</p>
        </div>
      ) : (
        <p className="hint">Phosphorus value unavailable for comparison.</p>
      )}

      {fertilizerOptions.length > 0 && (
        <>
          <h3>Fertilizer Options</h3>
          <p className="hint fertilizer-intro">
            To supply the {fertilizerOptions[0].p2o5NeededKgPerHa} kg/ha P₂O₅
            shortfall, apply approximately one of the following per hectare
            (pick one product, not all three):
          </p>
          <div className="grid" style={{ gridTemplateColumns: "1fr" }}>
            {fertilizerOptions.map((f) => (
              <div key={f.name} className="nutrient-card fertilizer-card">
                <div>
                  <span className="nutrient-label">{f.name} ({f.formula})</span>
                  <span className="nutrient-hint">{f.note}</span>
                </div>
                <span className="nutrient-value">
                  {f.kgPerHa} <span className="unit">kg/ha</span>
                </span>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="disclaimer">
        <strong>Note:</strong> N and K are shown as "Model unavailable" because
        the underlying pipeline does not currently include trained Nitrogen or
        Potassium classifiers — only Phosphorus, pH, Organic Matter, and EC
        models are deployed. Crop targets and fertilizer quantities shown here
        use general agronomic reference values and standard P → P₂O₅
        conversion factors — not a substitute for laboratory soil testing and
        local agronomy advice. Always confirm fertilizer application rates
        with a certified soil testing lab or agricultural extension officer
        before applying inputs in the field.
      </div>
    </section>
  );
}
