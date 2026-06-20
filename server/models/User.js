import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    callsign: { type: String, trim: true, default: "" }, // optional operator handle
  },
  { timestamps: true }
);

// Never leak the hash when serializing a user to JSON.
userSchema.methods.toSafeJSON = function () {
  return { id: this._id, email: this.email, callsign: this.callsign, createdAt: this.createdAt };
};

export default mongoose.model("User", userSchema);
