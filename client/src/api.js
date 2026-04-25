const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export async function scoreApplication(application) {
  const response = await fetch(`${API_URL}/api/score`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(application)
  });

  if (!response.ok) {
    throw new Error("Unable to score this application");
  }

  return response.json();
}

export async function fetchAudits() {
  const response = await fetch(`${API_URL}/api/audits`);

  if (!response.ok) {
    throw new Error("Unable to load audit history");
  }

  return response.json();
}
