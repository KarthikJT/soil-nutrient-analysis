# Soil Nutrient Analysis Web App

Upload an RGB soil image, select a crop, and get Phosphorus, pH, Organic
Matter, and EC readings with crop-specific fertilizer recommendations.

Built on top of the trained models from
[Final-Year-Project-Soil-Analysis-using-machine-learning](https://github.com/yousaf2018/Final-Year-Project-Soil-Analysis-using-machine-learning).

## Structure

- `backend/` — Flask API serving the 4 trained `.pkl` models
- `frontend/` — React (Vite) dashboard

## Notes

- Nitrogen (N) and Potassium (K) are intentionally shown as "Model
  unavailable" — the underlying dataset/models never included them.
- Crop fertilizer targets are general agronomic reference values, not
  lab-calibrated for any specific field.

See `backend/README.md` and `frontend/README.md` (if present) for setup.
