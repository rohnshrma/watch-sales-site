// Mongoose handles schema/model mapping for MongoDB.
import mongoose from "mongoose";
// bcryptjs provides safe password hashing and verification helpers.
import bcrypt from "bcryptjs";

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
  this.password = await bcrypt.hash(this.password, 10);
  return next();
});

// Instance method validates login password against stored hash.
userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

// Create User model.
const User = mongoose.model("User", userSchema);

// Export model for auth middleware/controllers.
export default User;
