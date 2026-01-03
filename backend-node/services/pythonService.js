import axios from "axios";

export const callPythonEvaluation = async (userId, rules, state) => {
  try {
    // Call Python FastAPI
    const response = await axios.post("http://127.0.0.1:8000/api/evaluate-rules", {
      userId,
      moment: { rules },
      state,
    });

    return response.data;
  } catch (err) {
    console.error("Error calling Python rules service:", err.message);
    throw new Error("Rules evaluation failed");
  }
};

export const evaluateRulesHandler = async (req, res) => {
  try {
    const { userId } = req;
    const { rules, state } = req.body;
    const data = await callPythonEvaluation(userId, rules, state);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};