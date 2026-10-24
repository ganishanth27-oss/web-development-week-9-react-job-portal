import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { loginUser, registerUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { validateRegistration, validateLogin } from "../utils/validation";

export default function Auth({ redirectTo, selectedJob, initialMode = "login" }) {
  const [isLogin, setIsLogin] = useState(initialMode !== "register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("user"); // "user" (candidate) | "employer" (recruiter)
  const [phone, setPhone] = useState("");

  const [validationErrors, setValidationErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { addToast } = useApp();

  const targetJob = selectedJob || location.state?.job;

  const getDashboardForRole = (userRole) => {
    if (userRole === "admin") return "/admin";
    if (userRole === "employer" || userRole === "recruiter") return "/recruiter";
    return "/dashboard";
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setServerError("");
    setMessage("");
    setValidationErrors({});

    // Client-side validation
    if (isLogin) {
      const { isValid, errors } = validateLogin({ email, password });
      if (!isValid) {
        setValidationErrors(errors);
        return;
      }
    } else {
      const { isValid, errors } = validateRegistration({
        name,
        email,
        password,
        confirmPassword,
        phone,
      });
      if (!isValid) {
        setValidationErrors(errors);
        return;
      }
    }

    setLoading(true);

    try {
      if (isLogin) {
        const data = await loginUser(email, password);

        // Update context & sessionStorage
        login(data.user, data.token);
        addToast({
          message: `Welcome back, ${data.user.name}!`,
          type: "success",
        });

        // If user was trying to apply to a job, redirect back with job state
        if (targetJob) {
          navigate("/apply", { state: { job: targetJob } });
        } else if (redirectTo || location.state?.from) {
          navigate(redirectTo || location.state?.from);
        } else {
          navigate(getDashboardForRole(data.user?.role));
        }
      } else {
        const data = await registerUser(name, email, password, role);

        // Check if registration returned a token immediately (auto-login support)
        if (data.token && data.user) {
          login(data.user, data.token);
          addToast({
            message: `Account created successfully! Welcome, ${data.user.name}.`,
            type: "success",
          });

          if (targetJob) {
            navigate("/apply", { state: { job: targetJob } });
          } else {
            navigate(getDashboardForRole(data.user?.role));
          }
        } else {
          setMessage((data.message || "Registration successful") + ". Please log in.");
          addToast({
            message: "Registration successful. Please log in.",
            type: "success",
          });
          setIsLogin(true);
          setPassword("");
          setConfirmPassword("");
        }
      }
    } catch (err) {
      setServerError(err.message || "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card" style={{ maxWidth: "480px" }}>
        <Link to="/" className="auth-brand">
          DG <span>Interns Hub</span>
        </Link>

        <p className="auth-label">YOUR CAREER STARTS HERE</p>

        <h1>{isLogin ? "Welcome Back!" : "Create Your Account"}</h1>

        <p className="auth-description">
          {isLogin
            ? "Log in to continue your career journey or manage recruitment."
            : "Join DG Interns Hub to discover opportunities or hire talent."}
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={isLogin ? "auth-tab active" : "auth-tab"}
            onClick={() => {
              setIsLogin(true);
              setServerError("");
              setMessage("");
              setValidationErrors({});
            }}
          >
            Login
          </button>

          <button
            type="button"
            className={!isLogin ? "auth-tab active" : "auth-tab"}
            onClick={() => {
              setIsLogin(false);
              setServerError("");
              setMessage("");
              setValidationErrors({});
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form" noValidate>
          {!isLogin && (
            <>
              {/* Role selector */}
              <div className="auth-field">
                <label>I want to join as a:</label>
                <div style={{ display: "flex", gap: "1rem", marginTop: "0.4rem" }}>
                  <label
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.6rem 0.8rem",
                      borderRadius: "8px",
                      border:
                        role === "user"
                          ? "1px solid var(--color-primary, #6366f1)"
                          : "1px solid var(--color-border, #334155)",
                      backgroundColor:
                        role === "user" ? "rgba(99, 102, 241, 0.15)" : "transparent",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                    }}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="user"
                      checked={role === "user"}
                      onChange={() => setRole("user")}
                      style={{ cursor: "pointer" }}
                    />
                    Candidate
                  </label>

                  <label
                    style={{
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.6rem 0.8rem",
                      borderRadius: "8px",
                      border:
                        role === "employer"
                          ? "1px solid var(--color-primary, #6366f1)"
                          : "1px solid var(--color-border, #334155)",
                      backgroundColor:
                        role === "employer" ? "rgba(99, 102, 241, 0.15)" : "transparent",
                      cursor: "pointer",
                      fontSize: "0.9rem",
                    }}
                  >
                    <input
                      type="radio"
                      name="role"
                      value="employer"
                      checked={role === "employer"}
                      onChange={() => setRole("employer")}
                      style={{ cursor: "pointer" }}
                    />
                    Recruiter
                  </label>
                </div>
              </div>

              <div className="auth-field">
                <label htmlFor="auth-name">Full Name</label>
                <input
                  id="auth-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="name"
                  style={validationErrors.name ? { borderColor: "var(--color-danger, #ef4444)" } : {}}
                />
                {validationErrors.name && (
                  <span style={{ color: "var(--color-danger, #ef4444)", fontSize: "0.8rem", marginTop: "0.25rem", display: "block" }}>
                    {validationErrors.name}
                  </span>
                )}
              </div>

              <div className="auth-field">
                <label htmlFor="auth-phone">Phone Number (Optional)</label>
                <input
                  id="auth-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  autoComplete="tel"
                  style={validationErrors.phone ? { borderColor: "var(--color-danger, #ef4444)" } : {}}
                />
                {validationErrors.phone && (
                  <span style={{ color: "var(--color-danger, #ef4444)", fontSize: "0.8rem", marginTop: "0.25rem", display: "block" }}>
                    {validationErrors.phone}
                  </span>
                )}
              </div>
            </>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              style={validationErrors.email ? { borderColor: "var(--color-danger, #ef4444)" } : {}}
            />
            {validationErrors.email && (
              <span style={{ color: "var(--color-danger, #ef4444)", fontSize: "0.8rem", marginTop: "0.25rem", display: "block" }}>
                {validationErrors.email}
              </span>
            )}
          </div>

          <div className="auth-field">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isLogin ? "Enter your password" : "At least 8 characters"}
              autoComplete={isLogin ? "current-password" : "new-password"}
              style={validationErrors.password ? { borderColor: "var(--color-danger, #ef4444)" } : {}}
            />
            {validationErrors.password && (
              <span style={{ color: "var(--color-danger, #ef4444)", fontSize: "0.8rem", marginTop: "0.25rem", display: "block" }}>
                {validationErrors.password}
              </span>
            )}
          </div>

          {!isLogin && (
            <div className="auth-field">
              <label htmlFor="auth-confirm-password">Confirm Password</label>
              <input
                id="auth-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                autoComplete="new-password"
                style={validationErrors.confirmPassword ? { borderColor: "var(--color-danger, #ef4444)" } : {}}
              />
              {validationErrors.confirmPassword && (
                <span style={{ color: "var(--color-danger, #ef4444)", fontSize: "0.8rem", marginTop: "0.25rem", display: "block" }}>
                  {validationErrors.confirmPassword}
                </span>
              )}
            </div>
          )}

          {serverError && (
            <div
              style={{
                backgroundColor: "rgba(239, 68, 68, 0.1)",
                border: "1px solid var(--color-danger, #ef4444)",
                color: "var(--color-danger, #ef4444)",
                padding: "0.75rem",
                borderRadius: "8px",
                fontSize: "0.875rem",
              }}
            >
              ⚠️ {serverError}
            </div>
          )}

          {message && (
            <div
              style={{
                backgroundColor: "rgba(34, 197, 94, 0.1)",
                border: "1px solid var(--color-success, #22c55e)",
                color: "var(--color-success, #22c55e)",
                padding: "0.75rem",
                borderRadius: "8px",
                fontSize: "0.875rem",
              }}
            >
              ✅ {message}
            </div>
          )}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : isLogin
              ? "Login to Your Account →"
              : "Create Account →"}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? "New to DG Interns Hub? " : "Already have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setServerError("");
              setMessage("");
              setValidationErrors({});
            }}
          >
            {isLogin ? "Register here" : "Login here"}
          </button>
        </p>

        <Link to="/" className="auth-home">
          ← Back to home
        </Link>
      </div>
    </section>
  );
}