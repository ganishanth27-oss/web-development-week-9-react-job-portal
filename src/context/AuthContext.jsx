import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { getMe, getToken, setToken, removeToken, getStoredUser, setStoredUser, logoutUser as apiLogout } from "../api";

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
  }, [verifySession]);

  const login = (newUser, newToken) => {
    setToken(newToken);
    setStoredUser(newUser);
    setTokenState(newToken);
    setUser(newUser);
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch {
      // Continue cleanup even if network fails
    } finally {
      removeToken();
      setTokenState(null);
      setUser(null);
    }
  };

  const updateUser = (updatedUser) => {
    const merged = { ...user, ...updatedUser };
    setUser(merged);
    setStoredUser(merged);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: Boolean(token && user),
        loading,
        login,
        logout,
        updateUser,
        refreshSession: verifySession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
