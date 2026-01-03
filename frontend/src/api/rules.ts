// frontend/src/services/ruleService.ts
import axios from "axios";

// Define the shape of the CSS variables object
interface CSSVariables {
  [key: string]: string;
}

// Define the response from the Node API
interface RulesResponse {
  rules: any[]; // You can replace 'any' with a proper Rule type later
  cssVariables: CSSVariables;
}

// Fetch all rules from Node, which communicates with Python
export const fetchRulesWithCSS = async (
  token: string
): Promise<RulesResponse> => {
  try {
    const response = await axios.get<RulesResponse>(
      "http://localhost:5000/api/rules",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    return response.data;
  } catch (err: any) {
    console.error("Failed to fetch rules:", err.message);
    return { rules: [], cssVariables: {} };
  }
};

// Apply CSS variables to the document
export const applyCSSVariables = (cssVars: CSSVariables): void => {
  Object.entries(cssVars).forEach(([key, value]) => {
    document.documentElement.style.setProperty(key, value);
  });
};
export const updateRule = async (
  token: string,
  id: string,
  content: string
) => {
  const response = await axios.patch(
    // Changed from .put to .patch to match your router
    `http://localhost:5000/api/rules/${id}`,
    { content },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};
