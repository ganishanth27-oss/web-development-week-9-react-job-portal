import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import NotificationPanel from "./NotificationPanel";

function Navbar() {
  const { user, isAuthenticated, logout, role } = useAuth();
  const { theme, toggleTheme, unreadCount } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setNotifOpen(false);
  }, [location.pathname]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
        setNotifOpen(false);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLogout = async () => {
    setMobileMenuOpen(false);
    await logout();
    navigate("/");
  };

  const getDashboardPath = () => {
    if (role === "admin") return "/admin";
    if (role === "recruiter") return "/recruiter";
    return "/dashboard";
  };

  const getDashboardLabel = () => {
    if (role === "admin") return "Admin";
    if (role === "recruiter") return "Recruiter";
    return "Dashboard";
  };

  return (
    <header className="navbar-wrapper">
      <nav className="navbar" aria-label="Main Navigation">
        <div className="nav-container">
          <Link to="/" className="logo" onClick={() => setMobileMenuOpen(false)}>
            DG <span>Interns Hub</span>
          </Link>

          {/* DESKTOP NAV LINKS */}
          <div className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/jobs">Jobs</Link>
            {isAuthenticated && (
              <>
                <Link to={getDashboardPath()}>{getDashboardLabel()}</Link>
                {role === "candidate" && (
                  <Link to="/my-applications">My Applications</Link>
                )}
                <Link to="/profile">Profile</Link>
              </>
            )}
            <Link to="/contact">Contact</Link>
          </div>

          {/* DESKTOP NAV ACTIONS */}
          <div className="nav-actions" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              style={{
                background: "var(--color-surface, #1e293b)",
                border: "1px solid var(--color-border, #334155)",
                color: "var(--color-text, #f8fafc)",
                fontSize: "1.1rem",
                padding: "0.4rem 0.65rem",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {theme === "dark" ? "☀️" : "🌙"}
            </button>

            {/* Notification Bell */}
            <button
              type="button"
              onClick={() => setNotifOpen((prev) => !prev)}
              aria-label="View notifications"
              title="Notifications"
              style={{
                position: "relative",
                background: "var(--color-surface, #1e293b)",
                border: "1px solid var(--color-border, #334155)",
                color: "var(--color-text, #f8fafc)",
                fontSize: "1.1rem",
                padding: "0.4rem 0.65rem",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              🔔
              {unreadCount > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    backgroundColor: "var(--color-danger, #ef4444)",
                    color: "#ffffff",
                    fontSize: "0.68rem",
                    fontWeight: 700,
                    width: "18px",
                    height: "18px",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {isAuthenticated ? (
              <div className="nav-user-cluster">
                <Link
                  to="/profile"
                  className="nav-user-greeting"
                  title="View Profile"
                >
                  <span className="user-avatar-icon" aria-hidden="true">
                    👤
                  </span>
                  <span className="user-name-text">
                    {user?.name || "User"}
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="nav-logout-button"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link to="/login" className="login-nav-button">
                Login / Register
              </Link>
            )}

            <Link to="/jobs" className="nav-button">
              Explore Jobs
            </Link>
          </div>

          {/* MOBILE HAMBURGER BUTTON */}
          <button
            type="button"
            className={`mobile-nav-toggle ${mobileMenuOpen ? "open" : ""}`}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-expanded={mobileMenuOpen}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
            <span className="hamburger-bar" />
          </button>
        </div>

        {/* MOBILE MENU DRAWER */}
        <div
          className={`mobile-nav-drawer ${mobileMenuOpen ? "active" : ""}`}
          aria-hidden={!mobileMenuOpen}
        >
          <div className="mobile-nav-links">
            <Link to="/" onClick={() => setMobileMenuOpen(false)}>
              Home
            </Link>
            <Link to="/jobs" onClick={() => setMobileMenuOpen(false)}>
              Explore Jobs
            </Link>
            {isAuthenticated && (
              <>
                <Link to={getDashboardPath()} onClick={() => setMobileMenuOpen(false)}>
                  {getDashboardLabel()} Dashboard
                </Link>
                {role === "candidate" && (
                  <Link
                    to="/my-applications"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Applications
                  </Link>
                )}
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                  My Profile
                </Link>
              </>
            )}
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </Link>
          </div>

          <div className="mobile-nav-actions" style={{ display: "flex", flexDirection: "column", gap: "0.75rem", padding: "1rem" }}>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                type="button"
                onClick={toggleTheme}
                style={{
                  flex: 1,
                  padding: "0.6rem",
                  borderRadius: "8px",
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text)",
                  cursor: "pointer",
                }}
              >
                {theme === "dark" ? "☀️ Light Mode" : "🌙 Dark Mode"}
              </button>
            </div>

            {isAuthenticated ? (
              <>
                <div className="mobile-user-greeting">
                  👤 Signed in as <strong>{user?.name || "User"}</strong> ({role})
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="mobile-logout-btn"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="mobile-login-btn"
                onClick={() => setMobileMenuOpen(false)}
              >
                Login / Register
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Floating Notifications Drawer */}
      <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />

      {mobileMenuOpen && (
        <div
          className="mobile-nav-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}
    </header>
  );
}

export default Navbar;