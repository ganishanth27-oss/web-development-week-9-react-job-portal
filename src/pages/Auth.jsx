import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { loginUser, registerUser } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Auth({ redirectTo, selectedJob }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const targetRedirect = redirectTo || location.state?.from || "/jobs";
  const targetJob = selectedJob || location.state?.job;

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      if (isLogin) {
        const data = await loginUser(email, password);

        // Update context & sessionStorage
        login(data.user, data.token);

        // If user was trying to apply to a job, redirect back with job state
        if (targetJob) {
          navigate("/apply", { state: { job: targetJob } });
        } else {
          navigate(targetRedirect);
        }
      } else {
        const data = await registerUser(name, email, password);

        // Check if registration returned a token immediately (auto-login support)
        if (data.token && data.user) {
          login(data.user, data.token);
          if (targetJob) {
            navigate("/apply", { state: { job: targetJob } });
          } else {
            navigate(targetRedirect);
          }
        } else {
          setMessage((data.message || "Registration successful") + ". Please log in.");
          setIsLogin(true);
          setPassword("");
        }
      }
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-page">
      <div className="auth-card">
        <Link to="/" className="auth-brand">
          DG <span>Interns Hub</span>
        </Link>

        <p className="auth-label">YOUR CAREER STARTS HERE</p>

        <h1>{isLogin ? "Welcome back!" : "Create your account"}</h1>

        <p className="auth-description">
          {isLogin
            ? "Log in to continue your career journey."
            : "Register to discover internship opportunities."}
        </p>

        <div className="auth-tabs">
          <button
            type="button"
            className={isLogin ? "auth-tab active" : "auth-tab"}
            onClick={() => {
              setIsLogin(true);
              setError("");
              setMessage("");
            }}
          >
            Login
          </button>

          <button
            type="button"
            className={!isLogin ? "auth-tab active" : "auth-tab"}
            onClick={() => {
              setIsLogin(false);
              setError("");
              setMessage("");
            }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {!isLogin && (
            <div className="auth-field">
              <label htmlFor="auth-name">Full name</label>
              <input
                id="auth-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                autoComplete="name"
                required
              />
            </div>
          )}

          <div className="auth-field">
            <label htmlFor="auth-email">Email address</label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              minLength={isLogin ? undefined : 6}
              required
            />
          </div>

          {error && <p className="auth-error">{error}</p>}
          {message && <p className="auth-success">{message}</p>}

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : isLogin
                ? "Login to your account →"
                : "Create account →"}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin
            ? "New to DG Interns Hub? "
            : "Already have an account? "}

          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
              setMessage("");
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