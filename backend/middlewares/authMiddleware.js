// jsonwebtoken verifies and decodes bearer tokens.
import jwt from "jsonwebtoken";
// User model is needed to load authenticated user context.
import User from "../models/user.js";

// Protect middleware enforces valid bearer auth on a route.
export const protect = async (req, res, next) => {
  let token;

  // Extract bearer token from Authorization header.
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
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
