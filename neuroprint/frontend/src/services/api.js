const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

export const postBehaviorSnapshot = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/biometrics/snapshot`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error("Failed to submit behavior snapshot");
  }

  return response.json();
};
