import mongoose from "mongoose";

// A free-text mission note, optionally pinned to a watchpoint.
const noteSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    body: { type: String, required: true, trim: true },
    watchpointId: { type: mongoose.Schema.Types.ObjectId, ref: "Watchpoint", default: null },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Note", noteSchema);
