const API_URL = "http://localhost:5000/api";

export const getUserMoments = async (token: string) => {
  const res = await fetch(`${API_URL}/moments`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) throw new Error("Failed to fetch moments");
  return res.json();
};
export const createMoment = async (
  token: string,
  data: { type: string; content: string; track: string[] }
) => {
  const response = await fetch(`${API_URL}/moments`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to create moment");
  return response.json();
};

export const deleteMoment = async (token: string, id: string) => {
  const response = await fetch(`${API_URL}/moments/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) throw new Error("Failed to delete moment");
  return response.json();
};
