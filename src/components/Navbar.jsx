import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="logo">
          DG <span>Interns Hub</span>
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/jobs">Jobs</Link>
          {isAuthenticated && (
            <>
              <Link to="/my-applications">My Applications</Link>
              <Link to="/profile">Profile</Link>
            </>
          )}
          <Link to="/contact">Contact</Link>
        </div>

        <div className="nav-actions">
          {isAuthenticated ? (
            <div className="nav-user-cluster">
              <Link to="/profile" className="nav-user-greeting" title="View profile">
                👤 <span>{user?.name || "My Account"}</span>
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
      </div>
    </nav>
  );
}

export default Navbar;