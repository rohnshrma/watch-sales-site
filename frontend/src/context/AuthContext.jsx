// React hooks manage auth state lifecycle and derived values.
import { createContext, useEffect, useMemo, useState } from "react";
// Shared API client for auth/profile requests.
import api from "../utils/api";

// Global auth context object.
const AuthContext = createContext();

// Storage key for persisted auth session.
const STORAGE_KEY = "watchStoreAuth";

// Provider exposes auth session + auth actions.
export const AuthProvider = ({ children }) => {
  // Current authenticated user profile.
  const [user, setUser] = useState(null);
  // Current bearer token string.
  const [token, setToken] = useState("");
  // Boot flag used while restoring local session.
  const [isLoading, setIsLoading] = useState(true);

  // Restore auth session from localStorage on first mount.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.token && parsed?.user) {
          setToken(parsed.token);
          setUser(parsed.user);
        }
      }
    } catch (error) {
      console.error("Failed to restore auth state:", error);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Normalizes and persists auth payload from backend response.
  const persistAuth = (authData) => {
    const safeData = {
      token: authData.token,
      user: {
        _id: authData._id,
        name: authData.name,
        email: authData.email,
        role: authData.role,
      },
    };

    setToken(safeData.token);
    setUser(safeData.user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(safeData));
  };

  // Registers a new user and starts authenticated session.
  const register = async (payload) => {
    const res = await api.post("/api/users/register", payload);
    persistAuth(res.data.data);
    return res.data;
  };

  // Logs in existing user and starts authenticated session.
  const login = async (payload) => {
    const res = await api.post("/api/users/login", payload);
    persistAuth(res.data.data);
    return res.data;
  };

  // Clears local session.
  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem(STORAGE_KEY);
  };

  // Fetches latest profile from backend for current token.
  const fetchProfile = async () => {
    if (!token) return null;
    const res = await api.get("/api/users/profile", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setUser(res.data.data);
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token, user: res.data.data })
    );

    return res.data.data;
  };

  // Updates profile and refreshes stored session payload.
  const updateProfile = async (payload) => {
    const res = await api.put("/api/users/profile", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    persistAuth(res.data.data);
    return res.data;
  };

  // Derived auth header object for protected API calls.
  const authHeaders = useMemo(
    () => (token ? { Authorization: `Bearer ${token}` } : {}),
    [token]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: Boolean(token && user),
        isAdmin: user?.role === "admin",
        authHeaders,
        register,
        login,
        logout,
        fetchProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Export context for useContext consumers.
export default AuthContext;
