import mongoose from "mongoose";

const ruleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: true }, 
  },
  { timestamps: true }
);

export default mongoose.model("Rule", ruleSchema);
