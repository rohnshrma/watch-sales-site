// jsonwebtoken generates JWTs compatible with common auth middleware.
import jwt from "jsonwebtoken";

// Creates a compact bearer token carrying user id + expiry.
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// Export token generator for auth controllers.
export default generateToken;
