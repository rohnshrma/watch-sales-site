import jwt from "jsonwebtoken";
import User from "../models/user.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

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
    } catch (error) {
      return res.status(401).json({
        status: "fail",
        message: "Not authorized",
        data: null,
      });
    }
  }

  return res.status(401).json({
    status: "fail",
    message: "No token provided",
    data: null,
  });
};

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
