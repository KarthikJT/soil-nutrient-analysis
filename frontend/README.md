# Soil Nutrient Analysis — Frontend

A React (Vite) dashboard for the soil-image analysis pipeline. Upload one RGB
soil image, pick a crop, and get back Phosphorus, pH, Organic Matter, and EC
readings from your Flask backend — compared against agronomic targets per
crop, with a plain-language fertilizer recommendation.

This package is **frontend only**. You already have the cloned repo
(`Final-Year-Project-Soil-Analysis-using-machine-learning`) with the trained
`.pkl` models — this app is built to talk to that backend via one endpoint.

## What's included here

- Complete Vite + React app (`src/`)
- `src/data/cropTargets.js` — ideal/target soil values per crop (Rice, Wheat,
  Maize, Tomato, Potato, Cotton) and the comparison logic that turns a raw P
  value into "sufficient/deficient" + kg/ha needed + a recommendation sentence
- UI that explicitly shows **Nitrogen and Potassium as "Model unavailable"**
  — it never fabricates values for them
- A dev proxy (`vite.config.js`) so `/api/*` calls forward to your Flask
  server during development, with no CORS setup needed

## What is NOT included / what you still need to add

1. **The Flask/FastAPI backend itself.** This app expects
   `POST /api/analyse-soil` to exist and return exactly:
   ```json
   {
     "nutrients": { "N": null, "P": 42, "K": null },
     "soilProperties": { "pH": 6.8, "OM": 1.9, "EC": 0.42 }
   }
   ```
   You already have the model loading/inference logic in the cloned repo
   (`Source Code/Mobile Application/Flask API/`). You need to wrap it in an
   endpoint that:
   - Accepts a multipart form with `image` (file) and `crop` (string)
   - Decodes the image with OpenCV, computes `temp = median(G) + median(B) + median(R)`
   - Runs `Pclassifier.pkl`, `pHclassifier.pkl`, `OMclassifier.pkl`,
     `ECclassifier.pkl` on that feature
   - Returns `N` and `K` as `null` — the repo has no trained models for
     these two, so do not invent numbers for them
   - Enables CORS (or rely on the Vite proxy in dev)

2. **Real N and K models.** Until Nitrogen and Potassium classifiers are
   trained and added, the UI will keep showing "Model unavailable" for both.
   That's intentional — don't wire fake values into the API response to make
   the cards "fill in."

3. **Validated crop targets.** The ideal-P values and pH/OM/EC ranges in
   `src/data/cropTargets.js` are general agronomic reference figures (typical
   Olsen-P sufficiency bands and commonly cited extension recommendations),
   not values calibrated to a specific field, soil type, or region. Swap
   them for numbers from a local soil testing lab / Krishi Vigyan Kendra /
   agronomist before using this for anything beyond a demo.

## Setup

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`. It expects your Flask backend on
`http://127.0.0.1:5000` (edit the `target` in `vite.config.js` if different).

Example minimal Flask endpoint shape you need to build inside your cloned
repo's `Flask API` folder (adjust to match how you already load the models
there):

```python
import cv2, numpy as np, pickle
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

MODELS = {
    "P": pickle.load(open("Pclassifier.pkl", "rb")),
    "pH": pickle.load(open("pHclassifier.pkl", "rb")),
    "OM": pickle.load(open("OMclassifier.pkl", "rb")),
    "EC": pickle.load(open("ECclassifier.pkl", "rb")),
}

@app.post("/api/analyse-soil")
def analyse_soil():
    file = request.files["image"]
    crop = request.form.get("crop")

    npimg = np.frombuffer(file.read(), np.uint8)
    img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)
    b, g, r = cv2.split(img)
    temp = float(np.median(g) + np.median(b) + np.median(r))
    feature = [[temp]]

    return jsonify({
        "nutrients": {
            "N": None,
            "P": float(MODELS["P"].predict(feature)[0]),
            "K": None,
        },
        "soilProperties": {
            "pH": float(MODELS["pH"].predict(feature)[0]),
            "OM": float(MODELS["OM"].predict(feature)[0]),
            "EC": float(MODELS["EC"].predict(feature)[0]),
        },
    })

if __name__ == "__main__":
    app.run(debug=True)
```

Confirm the exact feature shape/order your `.pkl` models were trained on in
the cloned repo before relying on the snippet above — match it to whatever
`temp`-based feature vector the original notebooks/scripts actually used.

## Build for production

```bash
npm run build
```

Outputs static files to `dist/`, ready to serve from Flask, nginx, or any
static host — just point it at your deployed API's `/api/analyse-soil` URL.

## Project structure

```
src/
  api.js                     → fetch wrapper for POST /api/analyse-soil
  App.jsx                    → top-level state (image, crop, result)
  components/
    UploadPanel.jsx           → image dropzone + crop select + Analyse button
    ResultsDashboard.jsx      → renders nutrients, properties, comparison
    NutrientCard.jsx          → small stat card (handles "Model unavailable")
  data/
    cropTargets.js            → ideal P/pH/OM/EC targets per crop + compare logic
  styles/
    index.css                 → all styling
```
