import mongoose from "mongoose";

const momentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    content: { type: String },
    track: [{ type: String }],
    state_snapshot: { type: mongoose.Schema.Types.Mixed },
    connections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Moment" }],
    customStyle: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model("Moment", momentSchema);
