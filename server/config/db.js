import mongoose from "mongoose";

// Graceful connect: if no MONGODB_URI is set, warn and continue so the
// server still boots during early development. Atlas wiring happens when
// the user provides a connection string (see DEPLOY.md / .env.example).
export async function connectDB() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn("⚠ No MONGODB_URI — running without DB (Sprint 0 skeleton).");
    return;
  }
  try {
    // Pin the database name so we always use `signal`, even if the connection
    // string has no path (Atlas's default string connects to `test`).
    await mongoose.connect(uri, { dbName: process.env.DB_NAME || "signal" });
    console.log(`▣ MongoDB connected (db: ${mongoose.connection.name})`);
  } catch (err) {
    console.error("✖ MongoDB connection failed:", err.message);
    // Don't crash — surface the error and keep the API up.
  }
}
