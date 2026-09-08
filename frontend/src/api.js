/**
 * Calls the backend soil-analysis endpoint.
 *
 * Expects the backend to return exactly:
 * {
 *   "nutrients": { "N": null, "P": 42, "K": null },
 *   "soilProperties": { "pH": 6.8, "OM": 1.9, "EC": 0.42 }
 * }
 *
 * N and K are expected to be null/absent until real trained models
 * are added on the backend — the UI renders those as
 * "Model unavailable" rather than fabricating a value.
 */
export async function analyseSoil(imageFile, crop) {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("crop", crop);

  const response = await fetch("/api/analyse-soil", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let detail = "";
    try {
      const errBody = await response.json();
      detail = errBody?.error || errBody?.message || "";
    } catch {
      // response wasn't JSON — ignore
    }
    throw new Error(
      detail || `Analysis failed (HTTP ${response.status}). Is the Flask backend running?`
    );
  }

  return response.json();
}
