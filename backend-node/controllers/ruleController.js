import Rule from "../models/Rule.js";
import { callPythonEvaluation } from "../services/pythonService.js";

const evaluateUserRules = async (userId, lastMoment = null) => {
  const rules = await Rule.find({ userId });
  const now = new Date();

  // Passing the actual values
  const cssVariables = await callPythonEvaluation(userId, rules, {
    hour: now.getHours(),
    minute: now.getMinutes(),
    lastMoment,
    userId,
  });

  return { rules, cssVariables };
};
export const getRules = async (req, res) => {
  try {
    const data = await evaluateUserRules(req.userId);
    res.status(200).json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const createRule = async (req, res) => {
  try {
    const newRule = new Rule({ ...req.body, userId: req.userId });
    await newRule.save();

    const data = await evaluateUserRules(req.userId);
    res.status(201).json({ rule: newRule, ...data });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const updateRule = async (req, res) => {
  try {
    const { id } = req.params;

    const updatedRule = await Rule.findOneAndUpdate(
      { _id: id, userId: req.userId },
      req.body,
      { new: true }
    );

    if (!updatedRule) {
      return res.status(404).json({ error: "Rule not found or unauthorized" });
    }

    const data = await evaluateUserRules(req.userId);
    res.json({ rule: updatedRule, ...data });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const deleteRule = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedRule = await Rule.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });
    if (!deletedRule) {
      return res.status(404).json({ error: "Rule not found or unauthorized" });
    }

    const data = await evaluateUserRules(req.userId);
    res.json({ message: "Rule deleted", ...data });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};
