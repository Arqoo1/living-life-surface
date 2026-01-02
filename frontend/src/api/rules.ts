const API_URL = "http://localhost:5000/api"; 

// Get all rules for the logged-in user
export const getUserRules = async (token: string) => {
  const res = await fetch(`${API_URL}/rules`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Failed to fetch rules");
  return res.json();
};

export const updateRule = async (id: string, data: { content: string }, token: string) => {
  const response = await fetch(`${API_URL}/rules/${id}`, {
    method: "PATCH", 
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to update rule");
  }
  return response.json();
};