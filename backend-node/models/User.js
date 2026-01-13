import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    settings: {
      globalColors: {
        background: { type: String, default: "#ffffff" },
        text: { type: String, default: "#1b1b1b" },
      },
      layoutDensity: { type: String, default: "medium" },
    },
    profilePic: {
      type: String,
      default: "default-guest.png",
    },
    resetPasswordCode: { type: String },
    resetPasswordExpires: { type: Date },
    rules: [{ type: mongoose.Schema.Types.ObjectId, ref: "Rule" }],
    xp: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },
    lastXpUpdate: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
