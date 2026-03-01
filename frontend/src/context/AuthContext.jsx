import { createContext, useEffect, useMemo, useState } from "react";
import api from "../utils/api";

const AuthContext = createContext();

const STORAGE_KEY = "watchStoreAuth";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [isLoading, setIsLoading] = useState(true);

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

  const register = async (payload) => {
    const res = await api.post("/api/users/register", payload);
    persistAuth(res.data.data);
    return res.data;
  };

  const login = async (payload) => {
    const res = await api.post("/api/users/login", payload);
    persistAuth(res.data.data);
    return res.data;
  };

  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem(STORAGE_KEY);
  };

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

  const updateProfile = async (payload) => {
    const res = await api.put("/api/users/profile", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
    persistAuth(res.data.data);
    return res.data;
  };

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

export default AuthContext;
