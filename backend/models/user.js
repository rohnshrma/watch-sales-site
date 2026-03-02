// Mongoose handles schema/model mapping for MongoDB.
import mongoose from "mongoose";
// Node crypto provides password hashing primitives without external packages.
import crypto from "node:crypto";

// Deterministically hashes a password using scrypt with per-user salt.
const hashPassword = (password, salt = crypto.randomBytes(16).toString("hex")) => {
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
};

// Verifies input password against stored salt:hash string.
const verifyPassword = (enteredPassword, storedHash) => {
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const entered = crypto.scryptSync(enteredPassword, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(entered, "hex"));
};

// User schema stores account identity + credential hash + role.
const userSchema = new mongoose.Schema(
  {
    // Display name shown in UI.
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Unique login identifier.
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    // Stored as salted hash, never plain-text.
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    // Role retained for optional admin checks.
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
  },
  // Adds createdAt/updatedAt timestamps.
  { timestamps: true }
);

// Pre-save hook hashes password when created/changed.
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = hashPassword(this.password);
  return next();
});

// Instance method validates login password against stored hash.
userSchema.methods.matchPassword = async function (enteredPassword) {
  return verifyPassword(enteredPassword, this.password);
};

// Create User model.
const User = mongoose.model("User", userSchema);

// Export model for auth middleware/controllers.
export default User;
