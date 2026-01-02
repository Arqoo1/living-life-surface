const API_URL = "http://localhost:5000/api"; 

export const getUserTracks = async (token: string) => {
  const res = await fetch(`${API_URL}/tracks`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
};