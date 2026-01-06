import User from "../models/User.js";
import Moment from "../models/Moment.js";
import Track from "../models/Track.js";
import Rule from "../models/Rule.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import {
  defaultMoments,
  defaultTracks,
  defaultRules,
} from "../defaults/newUserData.js";

export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({ username, email, passwordHash });
    await user.save();

    const userMoments = defaultMoments.map((m) => ({ ...m, userId: user._id }));
    await Moment.insertMany(userMoments);

    const userTracks = defaultTracks.map((t) => ({ ...t, userId: user._id }));
    await Track.insertMany(userTracks);

    const userRules = defaultRules.map((r) => ({ ...r, userId: user._id }));
    const insertedRules = await Rule.insertMany(userRules);

    user.rules = insertedRules.map((r) => r._id);
    await user.save();

    res.status(201).json({
      message: "User registered successfully. Please log in.",
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      message: "Login successful",
      token,
      userId: user._id,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "No token provided" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};
