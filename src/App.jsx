
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  Navigate,
  Outlet,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

import Auth from "./pages/Auth";
import ApplicationForm from "./pages/ApplicationForm";
import Jobs from "./pages/Jobs";
import MyApplications from "./pages/MyApplications";
import Profile from "./pages/Profile";
import JobDetails from "./pages/JobDetails";
import Dashboard from "./pages/Dashboard";

import { AuthProvider, useAuth } from "./context/AuthContext";

import logo from "./assets/dg-logo.png";
import "./App.css";

// =========================================================
// HOME PAGE
// =========================================================

function Home() {
  return (
    <>
      <section className="hero">
        <img
          src={logo}
          alt="DG Interns Hub Logo"
          className="hero-logo"
        />

        <div className="hero-content">
          <div className="hero-badge">
            🚀 START YOUR CAREER JOURNEY
          </div>

          <h1>
            Find Your Next
            <span> Internship Opportunity</span>
          </h1>

          <p>
            Discover internships, gain real-world experience,
            and take the next step toward your dream career.
          </p>

          <div className="hero-buttons">
            <Link to="/jobs" className="primary-button">
              Explore Opportunities →
            </Link>

            <a href="#why-us" className="secondary-button">
              Learn More
            </a>
          </div>
        </div>
      </section>

      <section id="why-us" className="why-section">
        <div className="section-heading">
          <p>WHY DG INTERNS HUB</p>

          <h2>
            Everything you need to
            <span> start your career</span>
          </h2>
        </div>

        <div className="feature-grid">
          <div className="feature-card">
            <div className="feature-icon">💼</div>
            <h3>Real Opportunities</h3>
            <p>
              Explore internship opportunities designed
              to provide practical industry experience.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🚀</div>
            <h3>Career Growth</h3>
            <p>
              Build your technical and professional skills
              through meaningful projects.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon">🌐</div>
            <h3>Multiple Domains</h3>
            <p>
              Discover opportunities across development,
              design, data, marketing and more.
            </p>
          </div>
        </div>
      </section>

      <section className="stats-section">
        <div>
          <strong>100+</strong>
          <span>Opportunities</span>
        </div>

        <div>
          <strong>50+</strong>
          <span>Companies</span>
        </div>

        <div>
          <strong>1000+</strong>
          <span>Students</span>
        </div>

        <div>
          <strong>10+</strong>
          <span>Domains</span>
        </div>
      </section>
    </>
  );
}

// =========================================================
// CONTACT PAGE
// =========================================================

function Contact() {
  const handleSubmit = (event) => {
    event.preventDefault();
    alert("Thank you! Your message has been submitted.");
  };

  return (
    <section className="contact-page">
      <div className="contact-container">
        <div className="contact-header">
          <p className="page-label">GET IN TOUCH</p>

          <h1>Contact DG Interns Hub</h1>

          <p>
            Have questions about internships or career
            opportunities? We'd love to hear from you.
          </p>
        </div>

        <div className="contact-content">
          <div className="contact-info">
            <h2>Let's connect</h2>

            <p>
              Reach out to us and our team will get back
              to you as soon as possible.
            </p>

            <div className="contact-item">
              <div className="contact-icon">📧</div>
              <div>
                <h3>Email</h3>
                <p>support@dginternshub.com</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">📍</div>
              <div>
                <h3>Location</h3>
                <p>India</p>
              </div>
            </div>

            <div className="contact-item">
              <div className="contact-icon">💼</div>
              <div>
                <h3>Career Support</h3>
                <p>Internship and career opportunities</p>
              </div>
            </div>
          </div>

          <form
            className="contact-form"
            onSubmit={handleSubmit}
          >
            <div className="form-group">
              <label htmlFor="contact-name">Your Name</label>
              <input
                id="contact-name"
                name="name"
                type="text"
                placeholder="Enter your name"
                autoComplete="name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-email">
                Email Address
              </label>
              <input
                id="contact-email"
                name="email"
                type="email"
                placeholder="Enter your email"
                autoComplete="email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-subject">Subject</label>
              <input
                id="contact-subject"
                name="subject"
                type="text"
                placeholder="Enter subject"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="contact-message">Message</label>
              <textarea
                id="contact-message"
                name="message"
                rows={5}
                placeholder="Write your message..."
                required
              />
            </div>

            <button
              type="submit"
              className="primary-button contact-button"
            >
              Send Message →
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}

// =========================================================
// LOGIN PAGE
// =========================================================

function LoginPage() {
  const location = useLocation();

  return (
    <Auth
      redirectTo={location.state?.from || "/jobs"}
      selectedJob={location.state?.job}
    />
  );
}

// =========================================================
// AUTHENTICATED HOME REDIRECT
// =========================================================

function PublicOnlyRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <section className="page-container" aria-live="polite">
        <p>Checking your login session...</p>
      </section>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}

// =========================================================
// MAIN APP ROUTING
// =========================================================

function AppRoutes() {
  return (
    <>
      <Navbar />

      <main>
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/contact" element={<Contact />} />

          {/* Login and registration */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>

          {/* Protected candidate pages */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />

            <Route
              path="/my-applications"
              element={<MyApplications />}
            />

            <Route
              path="/applications"
              element={<MyApplications />}
            />

            <Route path="/profile" element={<Profile />} />

            <Route path="/apply" element={<ApplicationForm />} />
          </Route>

          {/* Unknown URLs */}
          <Route
            path="*"
            element={
              <section className="page-container">
                <h1>Page not found</h1>
                <p>
                  The page you're looking for doesn't exist.
                </p>
                <Link to="/">Return Home</Link>
              </section>
            }
          />
        </Routes>
      </main>

      <Footer />
    </>
  );
}

// =========================================================
// APP PROVIDERS
// =========================================================

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
