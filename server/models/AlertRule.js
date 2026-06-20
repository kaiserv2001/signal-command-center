import mongoose from "mongoose";

// A rule evaluated against incoming signal events. Example:
//   "quake with magnitude >= 5 within radius of watchpoint X" -> emit alert:hit
const alertRuleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    source: {
      type: String,
      enum: ["quake", "aircraft", "iss", "spaceweather", "weather"],
      required: true,
    },
    // Condition on the normalized event's `magnitude` scalar.
    field: { type: String, default: "magnitude" },
    op: { type: String, enum: ["gte", "lte", "gt", "lt", "eq"], default: "gte" },
    value: { type: Number, required: true },
    // Optional geofence: only fire if the event is within this watchpoint's radius.
    watchpointId: { type: mongoose.Schema.Types.ObjectId, ref: "Watchpoint", default: null },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("AlertRule", alertRuleSchema);
