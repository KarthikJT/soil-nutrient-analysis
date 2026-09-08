const API_BASE_URL = import.meta.env.VITE_API_URL || "";

export async function analyseSoil(imageFile, crop) {
  const formData = new FormData();
  formData.append("image", imageFile);
  formData.append("crop", crop);

  const response = await fetch(`${API_BASE_URL}/api/analyse-soil`, {
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
      detail || `Analysis failed (HTTP ${response.status}).`
    );
  }

  return response.json();
}
