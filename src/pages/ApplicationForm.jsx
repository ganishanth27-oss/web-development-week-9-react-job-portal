import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { submitApplication } from "../api";
import { useAuth } from "../context/AuthContext";

export default function ApplicationForm() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const job = state?.job;

  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [savedStatus, setSavedStatus] = useState("Pending");
  const [submitting, setSubmitting] = useState(false);

  // Require login before applying
  if (!isAuthenticated) {
    return (
      <section className="application-page">
        <div className="application-card">
          <h1>Authentication Required</h1>
          <p>Please log in before applying for an internship.</p>
          <div className="application-action-buttons">
            <Link
              to="/login"
              state={{ from: "/apply", job }}
              className="primary-button"
            >
              Log in to Continue →
            </Link>
            <Link to="/jobs" className="secondary-button">
              Back to jobs
            </Link>
          </div>
        </div>
      </section>
    );
  }

  if (!job) {
    return (
      <section className="application-page">
        <div className="application-card">
          <h1>No internship selected</h1>
          <p>Please select an internship opportunity to apply.</p>
          <Link to="/jobs" className="primary-button">
            Browse Internships →
          </Link>
        </div>
      </section>
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return; // Prevent duplicate submissions

    setError("");
    setSubmitting(true);

    try {
      const payload = {
        jobTitle: job.title,
        company: job.company,
        location: job.location,
        category: job.category || job.type || "Engineering",
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        resumeUrl: resumeUrl.trim(),
        coverLetter: coverLetter.trim(),
      };

      // If job has a MongoDB _id or id, attach it
      const jobId = job._id || job.id;
      if (jobId && /^[0-9a-fA-F]{24}$/.test(jobId)) {
        payload.job = jobId;
      }

      const result = await submitApplication(payload);

      setSuccess(result.message || "Your application was submitted successfully!");
      if (result.application?.status) {
        setSavedStatus(result.application.status);
      }
    } catch (err) {
      if (
        err.status === 401 ||
        err.message?.toLowerCase().includes("log in") ||
        err.message?.toLowerCase().includes("session has expired")
      ) {
        navigate("/login", { state: { from: "/apply", job } });
        return;
      }

      setError(err.message || "Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <section className="application-page">
        <div className="application-card">
          <div className="success-badge">✓ SUCCESS</div>
          <h1>Application Submitted!</h1>
          <p className="auth-success">{success}</p>

          <div className="application-summary-card">
            <p><strong>Internship:</strong> {job.title}</p>
            <p><strong>Company:</strong> {job.company}</p>
            <p><strong>Location:</strong> {job.location}</p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={`status-tag status-${savedStatus.toLowerCase()}`}>
                {savedStatus}
              </span>
            </p>
          </div>

          <div className="application-action-buttons">
            <Link to="/my-applications" className="primary-button">
              View My Applications →
            </Link>
            <Link to="/jobs" className="secondary-button">
              Explore More Internships
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="application-page">
      <div className="application-card">
        <Link to="/jobs" className="back-link">← Back to jobs</Link>

        <p className="page-label">INTERNSHIP APPLICATION</p>
        <h1>Apply for {job.title}</h1>
        <p className="job-subheading">{job.company} · {job.location}</p>

        <form className="application-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="fullName">Full name *</label>
            <input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Jane Doe"
              maxLength={100}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email address *</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jane@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone number *</label>
            <input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 9876543210"
              pattern="[+0-9 ().-]{7,20}"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="resumeUrl">Resume URL *</label>
            <input
              id="resumeUrl"
              type="url"
              value={resumeUrl}
              onChange={(e) => setResumeUrl(e.target.value)}
              placeholder="https://drive.google.com/... or https://example.com/resume.pdf"
              required
            />
            <small>
              Use a public shareable HTTP/HTTPS link to your resume (e.g. Google Drive, Dropbox, LinkedIn).
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="coverLetter">Cover letter (optional)</label>
            <textarea
              id="coverLetter"
              rows="5"
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              placeholder="Introduce yourself and explain why you're a great fit for this role..."
              maxLength={2000}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button
            type="submit"
            className="auth-submit"
            disabled={submitting}
          >
            {submitting ? "Submitting application..." : "Submit Application →"}
          </button>
        </form>
      </div>
    </section>
  );
}
