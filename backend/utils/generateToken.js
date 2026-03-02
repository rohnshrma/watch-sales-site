// Node crypto module provides HMAC signing without external dependencies.
import crypto from "node:crypto";

// Encodes a JSON object using base64url encoding.
const encode = (value) => {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
};

// Signs the payload with HMAC SHA-256 using JWT_SECRET.
const sign = (data, secret) => {
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
};

// Creates a compact bearer token carrying user id + expiry.
const generateToken = (id) => {
  const secret = process.env.JWT_SECRET;
  // Header is metadata about algorithm/type.
  const header = encode({ alg: "HS256", typ: "JWT" });
  // Payload carries user id and expiration timestamp.
  const payload = encode({ id, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 });
  const signature = sign(`${header}.${payload}`, secret);
  return `${header}.${payload}.${signature}`;
};

// Export token generator for auth controllers.
export default generateToken;
