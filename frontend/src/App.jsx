import { useState, useEffect } from "react";
import UploadPanel from "./components/UploadPanel.jsx";
import ResultsDashboard from "./components/ResultsDashboard.jsx";
import { analyseSoil } from "./api.js";

export default function App() {
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [crop, setCrop] = useState("Rice");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!imageFile) {
      setImagePreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  function handleImageChange(file) {
    setImageFile(file);
    setResult(null);
    setError(null);
  }

  async function handleAnalyse() {
    if (!imageFile) return;
    setLoading(true);
    setError(null);
    try {
      const data = await analyseSoil(imageFile, crop);
      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong during analysis.");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🌱 Soil Nutrient Analysis Dashboard</h1>
        <p>Upload an RGB soil image to estimate nutrients and get fertilizer guidance.</p>
      </header>

      <main className="app-main">
        <UploadPanel
          imageFile={imageFile}
          imagePreviewUrl={imagePreviewUrl}
          crop={crop}
          onImageChange={handleImageChange}
          onCropChange={setCrop}
          onAnalyse={handleAnalyse}
          loading={loading}
          error={error}
        />
        <ResultsDashboard result={result} crop={crop} imagePreviewUrl={imagePreviewUrl} />
      </main>

      <footer className="app-footer">
        <p>
          Built on top of{" "}
          <a
            href="https://github.com/yousaf2018/Final-Year-Project-Soil-Analysis-using-machine-learning"
            target="_blank"
            rel="noreferrer"
          >
            Final-Year-Project-Soil-Analysis-using-machine-learning
          </a>
          . Results are indicative and require lab validation.
        </p>
      </footer>
    </div>
  );
}
