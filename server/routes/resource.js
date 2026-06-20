import { Router } from "express";
import { auth } from "../middleware/auth.js";

// Wraps an async handler so bad ObjectIds (CastError) become 404 and schema
// violations become 400 instead of unhandled 500s.
function safe(handler) {
  return async (req, res) => {
    try {
      await handler(req, res);
    } catch (e) {
      if (e.name === "CastError") return res.status(404).json({ error: "not found" });
      if (e.name === "ValidationError") return res.status(400).json({ error: e.message });
      console.error(e);
      return res.status(500).json({ error: "server error" });
    }
  };
}

// Builds a user-scoped CRUD router for a model. EVERY query is filtered by
// req.user.id, so one operator can never read or mutate another's records.
// This is the "CRUD-scope" seam integration-QA verifies.
export function makeResourceRouter({ model, fields, validateCreate }) {
  const router = Router();
  router.use(auth); // all routes require a valid token

  const pick = (body = {}) => {
    const out = {};
    for (const f of fields) if (body[f] !== undefined) out[f] = body[f];
    return out;
  };

  // LIST own
  router.get("/", safe(async (req, res) => {
    const items = await model.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.json({ items });
  }));

  // CREATE
  router.post("/", safe(async (req, res) => {
    const data = pick(req.body);
    const err = validateCreate ? validateCreate(data) : null;
    if (err) return res.status(400).json({ error: err });
    const item = await model.create({ ...data, userId: req.user.id });
    res.status(201).json({ item });
  }));

  // UPDATE own only
  router.patch("/:id", safe(async (req, res) => {
    const item = await model.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      pick(req.body),
      { new: true, runValidators: true }
    );
    if (!item) return res.status(404).json({ error: "not found" });
    res.json({ item });
  }));

  // DELETE own only
  router.delete("/:id", safe(async (req, res) => {
    const item = await model.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!item) return res.status(404).json({ error: "not found" });
    res.json({ ok: true, id: req.params.id });
  }));

  return router;
}
