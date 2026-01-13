import Rule from "../models/Rule.js";
import User from "../models/User.js"; // Added User model import
import { callPythonEvaluation } from "../services/pythonService.js";
import { addXP } from "../services/xpService.js";

const evaluateUserRules = async (
  userId,
  lastMoment = null,
  externalState = {}
) => {
  // 1. Fetch the user to get current XP/Level
  const user = await User.findById(userId);
  const rules = await Rule.find({ userId });
  const now = new Date();

  const combinedState = {
    hour: externalState.hour ?? now.getHours(),
    minute: externalState.minute ?? now.getMinutes(),
    lastMoment: lastMoment || externalState.lastMoment || null,
    userId,
    streak: externalState.streak || 0,
    battery: externalState.battery || 100,
    momentCount: externalState.momentCount || 0,
    // 2. Pass Level/XP to the Python Engine
    level: user?.level || 1,
    xp: user?.xp || 0,
  };

  const cssVariables = await callPythonEvaluation(userId, rules, combinedState);

  // 3. Return user stats so the frontend can display them
  return {
    rules,
    cssVariables,
    level: user?.level || 1,
    xp: user?.xp || 0,
  };
};

export const getRules = async (req, res) => {
  try {
    const { state } = req.body;
    const data = await evaluateUserRules(req.userId, null, state);
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

    // 4. Reward +20 XP for creating a new rule
    const user = await User.findById(req.userId);
    if (user) await addXP(user, 20);

    const data = await evaluateUserRules(req.userId, null, req.body.state);
    res.status(201).json({ rule: newRule, ...data });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const updateRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, state } = req.body;

    // 1. Find the existing rule first to check the current content
    const existingRule = await Rule.findOne({ _id: id, userId: req.userId });

    if (!existingRule) {
      return res.status(404).json({ error: "Rule not found or unauthorized" });
    }

    // 2. CHECK: Is the new content actually different?
    const isChanged = existingRule.content !== content;

    if (isChanged) {
      existingRule.content = content;
      await existingRule.save();

      // 3. ONLY reward XP if the content was actually modified
      const user = await User.findById(req.userId);
      if (user) {
        await addXP(user, 5); 
        console.log("XP Rewarded: Rule content changed.");
      }
    } else {
      console.log("No XP Rewarded: Content is identical.");
    }

    // 4. Evaluate rules (always do this to ensure CSS stays synced)
    const data = await evaluateUserRules(req.userId, null, state);
    
    // Return the existing/updated rule and the new evaluation data
    res.json({ rule: existingRule, ...data });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};

export const deleteRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { state } = req.body;

    const deletedRule = await Rule.findOneAndDelete({
      _id: id,
      userId: req.userId,
    });

    if (!deletedRule) {
      return res.status(404).json({ error: "Rule not found or unauthorized" });
    }

    const data = await evaluateUserRules(req.userId, null, state);
    res.json({ message: "Rule deleted", ...data });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
};
