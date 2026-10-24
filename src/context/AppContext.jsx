import { createContext, useContext, useState, useEffect } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  // Theme state: dark or light, persisted in localStorage
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("dg_theme") || "dark";
    } catch {
      return "dark";
    }
  });

  // Notifications state
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem("dg_notifications");
      return stored
        ? JSON.parse(stored)
        : [
            {
              id: "welcome-1",
              title: "Welcome to DG Interns Hub",
              message: "Discover verified internships and elevate your career.",
              type: "info",
              read: false,
              timestamp: new Date().toISOString(),
            },
          ];
    } catch {
      return [];
    }
  });

  // Toast notification state
  const [toasts, setToasts] = useState([]);

  // Sync theme to root DOM element
  useEffect(() => {
    try {
      localStorage.setItem("dg_theme", theme);
      document.documentElement.setAttribute("data-theme", theme);
      if (theme === "dark") {
        document.documentElement.classList.add("dark-theme");
        document.documentElement.classList.remove("light-theme");
      } else {
        document.documentElement.classList.add("light-theme");
        document.documentElement.classList.remove("dark-theme");
      }
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  // Persist notifications
  useEffect(() => {
    try {
      localStorage.setItem("dg_notifications", JSON.stringify(notifications));
    } catch {
      // Ignore storage errors
    }
  }, [notifications]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const addNotification = ({ title, message, type = "info" }) => {
    const newNotif = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      title,
      message,
      type,
      read: false,
      timestamp: new Date().toISOString(),
    };
    setNotifications((prev) => [newNotif, ...prev]);

    // Also trigger toast for instant feedback
    addToast({ title, message, type });
  };

  const markAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  const addToast = ({ message, type = "info", duration = 4000 }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AppContext.Provider
      value={{
        theme,
        toggleTheme,
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        toasts,
        addToast,
        removeToast,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}

export default AppContext;
