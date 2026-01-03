const API_URL = "http://localhost:5000/api";

export const getUserTracks = async (token: string) => {
  const res = await fetch(`${API_URL}/tracks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};

export const createTrack = async (token: string, name: string) => {
  const res = await fetch(`${API_URL}/tracks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, color: "#60a5fa" }), // Default color
  });
  if (!res.ok) throw new Error("Failed to create track");
  return res.json();
};

export const deleteTrack = async (token: string, trackId: string) => {
  const res = await fetch(`${API_URL}/tracks/${trackId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.message || "Failed to delete track");
  }

  return res.json();
};
