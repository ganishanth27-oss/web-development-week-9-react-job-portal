import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
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
                <Link to="/dashboard">Dashboard</Link>
                <Link to="/my-applications">My Applications</Link>
                <Link to="/profile">Profile</Link>
              </>
            )}
            <Link to="/contact">Contact</Link>
          </div>

          {/* DESKTOP NAV ACTIONS */}
          <div className="nav-actions">
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
                    {user?.name || "Candidate"}
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
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  Candidate Dashboard
                </Link>
                <Link
                  to="/my-applications"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  My Applications
                </Link>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)}>
                  My Profile
                </Link>
              </>
            )}
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)}>
              Contact
            </Link>
          </div>

          <div className="mobile-nav-actions">
            {isAuthenticated ? (
              <>
                <div className="mobile-user-greeting">
                  👤 Signed in as <strong>{user?.name || "Candidate"}</strong>
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