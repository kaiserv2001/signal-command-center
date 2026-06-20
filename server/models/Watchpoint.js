import mongoose from "mongoose";

// A named location an operator is monitoring, plus which feed sources apply.
const watchpointSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    lat: { type: Number, required: true, min: -90, max: 90 },
    lon: { type: Number, required: true, min: -180, max: 180 },
    radiusKm: { type: Number, default: 200, min: 1 },
    sources: {
      type: [String],
      enum: ["quake", "aircraft", "iss", "spaceweather", "weather"],
      default: ["quake"],
    },
  },
  { timestamps: true }
);

export default mongoose.model("Watchpoint", watchpointSchema);
