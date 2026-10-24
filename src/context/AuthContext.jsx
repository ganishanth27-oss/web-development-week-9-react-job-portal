import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  getMe,
  getToken,
  setToken,
  removeToken,
  getStoredUser,
  setStoredUser,
  logoutUser as apiLogout,
} from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setTokenState] = useState(() => getToken());
  const [loading, setLoading] = useState(true);

  // Validate session on mount if token is present
  const verifySession = useCallback(async () => {
    const currentToken = getToken();
    if (!currentToken) {
      setUser(null);
      setTokenState(null);
      setLoading(false);
      return;
    }

    try {
      const data = await getMe();
      if (data?.user) {
        setUser(data.user);
        setStoredUser(data.user);
        setTokenState(currentToken);
      }
    } catch (err) {
      // If token expired or invalid (401), clean up
      if (err.status === 401) {
        removeToken();
        setUser(null);
        setTokenState(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    verifySession();

    // Listen for unauthorized events emitted by apiClient interceptor
    const handleUnauthorized = () => {
      removeToken();
      setUser(null);
      setTokenState(null);
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
    };
  }, [verifySession]);

  const login = useCallback((newUser, newToken) => {
    setToken(newToken);
    setStoredUser(newUser);
    setTokenState(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(async () => {
    try {
      await apiLogout();
    } catch {
      // Continue cleanup even if network fails
    } finally {
      removeToken();
      setTokenState(null);
      setUser(null);
    }
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUser };
      setStoredUser(merged);
      return merged;
    });
  }, []);

  const userRole = useMemo(() => {
    if (!user?.role) return "guest";
    if (user.role === "admin") return "admin";
    if (user.role === "employer") return "recruiter";
    return "candidate";
  }, [user?.role]);

  const value = useMemo(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token && user),
      role: userRole,
      isCandidate: userRole === "candidate",
      isRecruiter: userRole === "recruiter",
      isAdmin: userRole === "admin",
      loading,
      login,
      logout,
      updateUser,
      refreshSession: verifySession,
    }),
    [user, token, userRole, loading, login, logout, updateUser, verifySession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
