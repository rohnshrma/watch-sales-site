// User model handles account persistence and password matching.
import User from "../models/user.js";
// Token helper creates JWT for session auth.
import generateToken from "../utils/generateToken.js";

// POST /api/users/register
export const REGISTER = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate required registration fields.
    if (!name || !email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Name, email and password are required",
        data: null,
      });
    }

    // Prevent duplicate accounts with same email.
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: "fail", message: "User already exists", data: null });
    }

    // Create user (password is hashed by schema pre-save hook).
    const user = await User.create({
      name,
      email,
      password,
    });

    // Return safe profile payload + JWT.
    return res.status(201).json({
      status: "success",
      message: "User registered successfully",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    return res.status(400).json({
      status: "fail",
      message: error.message,
      data: null,
    });
  }
};

// POST /api/users/login
export const LOGIN = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required login fields.
    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Email and password are required",
        data: null,
      });
    }

    // Locate account by email.
    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ status: "fail", message: "User does not exist", data: null });
    }

    // Verify submitted password.
    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ status: "fail", message: "Invalid password", data: null });
    }

    // Return safe profile payload + JWT.
    return res.status(200).json({
      status: "success",
      message: "Login successful",
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    return res.status(400).json({
      status: "fail",
      message: error.message,
      data: null,
    });
  }
};

// GET /api/users/profile
export const GET_USER_PROFILE = async (req, res) => {
  try {
    // req.user is populated by protect middleware.
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
        data: null,
      });
    }

    return res
      .status(200)
      .json({ data: user, message: "User found", status: "success" });
  } catch (error) {
    return res.status(400).json({
      status: "fail",
      message: error.message,
      data: null,
    });
  }
};

// PUT /api/users/profile
export const UPDATE_USER_PROFILE = async (req, res) => {
  try {
    // Load authenticated user.
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", data: null, status: "fail" });
    }

    const { name, email, password } = req.body;

    // Enforce email uniqueness for updated email.
    if (email && email !== user.email) {
      const emailTaken = await User.findOne({ email, _id: { $ne: user._id } });
      if (emailTaken) {
        return res.status(400).json({
          status: "fail",
          message: "Email already in use",
          data: null,
        });
      }
    }

    // Apply profile updates.
    user.name = name || user.name;
    user.email = email || user.email;

    // Set new password if provided (will be hashed by pre-save hook).
    if (password) {
      user.password = password;
    }

    const updatedUser = await user.save();

    // Return updated payload and refreshed token.
    return res.status(200).json({
      status: "success",
      message: "Profile updated",
      data: {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        token: generateToken(updatedUser._id),
      },
    });
  } catch (error) {
    return res.status(400).json({
      status: "fail",
      message: error.message,
      data: null,
    });
  }
};
