import { API_BASE_URL } from "./baseUrl";

export async function analyzeArtifactImage(imageUri) {
  const formData = new FormData();

  formData.append("image", {
    uri: imageUri,
    name: "scan.jpg",
    type: "image/jpeg",
  });

  const response = await fetch(`${API_BASE_URL}/api/ai/analyze`, {
    method: "POST",
    body: formData,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.message || "AI analysis failed");
  }

  return data;
}

export default function AiApiRouteStub() {
  return null;
}
