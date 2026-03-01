import User from "../models/user.js";
import generateToken from "../utils/generateToken.js";

export const REGISTER = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Name, email and password are required",
        data: null,
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ status: "fail", message: "User already exists", data: null });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

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

export const LOGIN = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: "fail",
        message: "Email and password are required",
        data: null,
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ status: "fail", message: "User does not exist", data: null });
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ status: "fail", message: "Invalid password", data: null });
    }

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

export const GET_USER_PROFILE = async (req, res) => {
  try {
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

export const DELETE_USER = async (req, res) => {
  try {
    const targetUserId = req.params.id;

    if (req.user.role !== "admin" && req.user.id !== targetUserId) {
      return res.status(403).json({
        status: "fail",
        message: "Not authorized to delete this user",
        data: null,
      });
    }

    const deletedUser = await User.findByIdAndDelete(targetUserId);
    if (!deletedUser) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
        data: null,
      });
    }

    return res.status(200).json({
      status: "success",
      message: "User deleted",
      data: null,
    });
  } catch (error) {
    return res.status(400).json({
      status: "fail",
      message: error.message,
      data: null,
    });
  }
};

export const UPDATE_USER_PROFILE = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found", data: null, status: "fail" });
    }

    const { name, email, password } = req.body;

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

    user.name = name || user.name;
    user.email = email || user.email;

    if (password) {
      user.password = password;
    }

    const updatedUser = await user.save();

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
