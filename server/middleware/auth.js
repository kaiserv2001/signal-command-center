import jwt from "jsonwebtoken";

// Verifies the Bearer token and attaches { id, email } to req.user.
// Protected routes mount this; without a valid token they get 401.
export function auth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "no token" });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: "bad token" });
  }
}

// Shared helper so routes and the socket handshake sign tokens identically.
export function signToken(user) {
  return jwt.sign(
    { id: user._id.toString(), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}
