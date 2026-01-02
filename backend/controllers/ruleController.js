import Rule from "../models/Rule.js";

export const getRules = async (req, res) => {
  try {
    const rules = await Rule.find({ userId: req.userId });
    res.status(200).json(rules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createRule = async (req, res) => {
  try {
    const newRule = new Rule({
      ...req.body,
      userId: req.userId 
    });
    await newRule.save();
    res.status(201).json(newRule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const updateRule = async (req, res) => {
  try {
    const { id } = req.params; 

    const rule = await Rule.findOneAndUpdate(
      { _id: id, userId: req.userId }, 
      req.body, 
      { new: true }
    );

    if (!rule) {
      return res.status(404).json({ error: "Rule not found or unauthorized" });
    }

    res.json(rule);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const deleteRule = async (req, res) => {
  try {
    const { id } = req.params; 

    const rule = await Rule.findOneAndDelete({ _id: id, userId: req.userId });

    if (!rule) {
      return res.status(404).json({ error: "Rule not found or unauthorized" });
    }

    res.json({ message: "Rule deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};