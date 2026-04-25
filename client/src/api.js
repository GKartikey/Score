const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/$/, "");

export async function scoreApplication(application) {
  const response = await fetch(`${API_BASE}/score`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(application)
  });

//added error handling for non-200 responses

  if (!response.ok) {
    throw new Error("Unable to score this application");
  }

  return response.json();
}

export async function fetchAudits() {
  const response = await fetch(`${API_BASE}/audits`);

  if (!response.ok) {
    throw new Error("Unable to load audit history");
  }

  return response.json();
}
