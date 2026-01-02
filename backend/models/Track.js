import mongoose from "mongoose";

const trackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true },
    color: { type: String, default: "#b890e3" },
  },
  { timestamps: true }
);

export default mongoose.model("Track", trackSchema);
