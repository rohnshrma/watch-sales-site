// Node crypto module verifies HMAC signatures.
import crypto from "node:crypto";
// User model is needed to load authenticated user context.
import User from "../models/user.js";

// Recomputes signature for token validation.
const sign = (data, secret) => {
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
};

// Verifies token format, signature, and expiry; returns payload or null.
const verifyToken = (token, secret) => {
  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) return null;
  const expected = sign(`${header}.${payload}`, secret);
  if (expected !== signature) return null;

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!decoded?.id || !decoded?.exp || Date.now() > decoded.exp) return null;
    return decoded;
  } catch {
    return null;
  }
};

// Protect middleware enforces valid bearer auth on a route.
export const protect = async (req, res, next) => {
  let token;

  // Extract bearer token from Authorization header.
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    const decoded = verifyToken(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({
        status: "fail",
        message: "Not authorized",
        data: null,
      });
    }

    // Attach current user (without password) to request object.
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        status: "fail",
        message: "Not authorized, user not found",
        data: null,
      });
    }

    req.user = user;
    return next();
  }

  // Reject requests without bearer token.
  return res.status(401).json({
    status: "fail",
    message: "No token provided",
    data: null,
  });
};

// Optional role guard for admin-only endpoints.
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({
    status: "fail",
    message: "Admin access required",
    data: null,
  });
};
