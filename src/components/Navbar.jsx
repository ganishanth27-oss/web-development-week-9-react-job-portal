import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="navbar">
      <div className="nav-container">

        <Link to="/" className="logo">
          DG <span>Interns Hub</span>
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/jobs">Jobs</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <Link to="/jobs" className="nav-button">
          Explore Jobs
        </Link>

      </div>
    </nav>
  );
}

export default Navbar;