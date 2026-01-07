import User from "../models/User.js";
import Moment from "../models/Moment.js";
import Track from "../models/Track.js";
import Rule from "../models/Rule.js";
import { sendEmail } from "../utils/sendEmail.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
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

export const getProfile = async (req, res) => {
  try {
    // Exclude passwordHash from the results for security
    const user = await User.findById(req.userId).select("-passwordHash");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
export const updateProfile = async (req, res) => {
  try {
    const { username, email, profilePic } = req.body;

    // 1. Get current user data to check for existing photo
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    let updateData = { username, email };

    // 2. CHECK FOR PHOTO REMOVAL
    // If frontend sends 'default-guest.png', delete the old file
    if (
      profilePic === "default-guest.png" &&
      user.profilePic !== "default-guest.png"
    ) {
      const oldPath = path.join(path.resolve(), "uploads", user.profilePic);

      if (fs.existsSync(oldPath)) {
        fs.unlink(oldPath, (err) => {
          if (err) console.error("Failed to delete removed image:", err);
        });
      }
      updateData.profilePic = "default-guest.png";
    }

    // 3. Update the database
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-passwordHash");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const uploadProfilePic = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    // 1. Find the user FIRST to get the old filename
    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2. DELETE THE OLD FILE (if it exists and isn't the default)
    if (user.profilePic && user.profilePic !== "default-guest.png") {
      const oldPath = path.join(path.resolve(), "uploads", user.profilePic);

      if (fs.existsSync(oldPath)) {
        fs.unlink(oldPath, (err) => {
          if (err) console.error("Failed to delete old image:", err);
          else console.log("Successfully deleted old image:", user.profilePic);
        });
      }
    }

    // 3. Update the database with the new filename
    user.profilePic = req.file.filename;
    await user.save();

    res.status(200).json({
      message: "Profile picture updated",
      profilePic: user.profilePic,
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const email = req.body.email || (req.user ? req.user.email : null);

    if (!email) {
      return res
        .status(400)
        .json({ error: "Email is required to reset password" });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found with this email" });
    }

    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetPasswordCode = resetCode;
    user.resetPasswordExpires = Date.now() + 10 * 60 * 1000;

    await user.save();

    await sendEmail({
      email: user.email,
      subject: "Your Password Reset Code",
      message: `Your code is: ${resetCode}. It will expire in 10 minutes.`,
    });

    res.status(200).json({ message: "Reset code sent to your email!" });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ error: "Email could not be sent" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res
        .status(400)
        .json({ error: "Please provide email, code, and new password" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.resetPasswordCode || user.resetPasswordCode !== code) {
      return res.status(400).json({ error: "Invalid reset code" });
    }

    if (user.resetPasswordExpires < Date.now()) {
      return res.status(400).json({ error: "Reset code has expired." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    user.passwordHash = hashedNewPassword;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password reset successful!" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
