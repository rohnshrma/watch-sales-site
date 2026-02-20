import User from "../models/user.js";
import generateToken from "../utils/generateToken.js";

export const REGISTER = async (req, res) => {
  try {
    const { name, email, password } = req.body;
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

    res.status(201).json({
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
    res.status(400).json({
      message: error.message,
      status: "fail",
    });
  }
};

export const LOGIN = async () => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res
        .status(400)
        .json({ status: "fail", message: "User doesn't exists", data: null });
    }

    if (await user.matchPassword(password)) {
      res.status(200).json({
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
    } else {
      return res
        .status(401)
        .json({ status: "fail", message: "Invalid Password", data: null });
    }
  } catch (error) {
    res.status(400).json({
      message: error.message,
      status: "fail",
    });
  }
};

export const GET_USER_PROFILE = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res
      .status(200)
      .json({ data: user, message: "User found", status: "success" });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      status: "fail",
    });
  }
};

export const DELETE_USER = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted", status: "success" });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      status: "fail",
    });
  }
};

export const UPDATE_USER_PROFILE = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return req
        .status(404)
        .json({ message: "User not found", data: null, status: "fail" });
    }

    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
      status: "fail",
    });
  }
};
