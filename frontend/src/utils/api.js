// Axios is used to create a reusable HTTP client instance.
import axios from "axios";

// Shared API client keeps base URL logic in one place.
const api = axios.create({
  // Uses environment override when available, otherwise local backend default.
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
});

// Export API client for use in contexts/pages.
export default api;
