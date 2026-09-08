import { useRef } from "react";
import { CROPS } from "../data/cropTargets.js";

export default function UploadPanel({
  imageFile,
  imagePreviewUrl,
  crop,
  onImageChange,
  onCropChange,
  onAnalyse,
  loading,
  error,
}) {
  const inputRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (file) onImageChange(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) onImageChange(file);
  }

  return (
    <section className="card upload-panel">
      <h2>1. Upload &amp; Configure</h2>

      <div
        className="dropzone"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        {imagePreviewUrl ? (
          <img src={imagePreviewUrl} alt="Soil preview" className="preview-image" />
        ) : (
          <div className="dropzone-placeholder">
            <span className="dropzone-icon">📷</span>
            <p>Click or drag a clear RGB soil image here</p>
            <p className="hint">JPG or PNG, well-lit, no shadows</p>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFile}
          hidden
        />
      </div>
      {imageFile && (
        <p className="filename">Selected: {imageFile.name}</p>
      )}

      <label className="field-label" htmlFor="crop-select">
        2. Select crop
      </label>
      <select
        id="crop-select"
        value={crop}
        onChange={(e) => onCropChange(e.target.value)}
        className="crop-select"
      >
        {CROPS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <button
        className="analyse-btn"
        onClick={onAnalyse}
        disabled={!imageFile || loading}
      >
        {loading ? "Analysing…" : "Analyse Soil"}
      </button>

      {error && <p className="error-text">{error}</p>}
    </section>
  );
}
