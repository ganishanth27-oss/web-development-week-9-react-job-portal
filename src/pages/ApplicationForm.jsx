
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { submitApplication } from "../api";
import { useAuth } from "../context/AuthContext";

const MAX_RESUME_SIZE = 5 * 1024 * 1024;

export default function ApplicationForm() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const job = state?.job;

  const [fullName, setFullName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [resumeFile, setResumeFile] = useState(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [savedStatus, setSavedStatus] = useState("Pending");
  const [submitting, setSubmitting] = useState(false);

  function handleResumeChange(event) {
    const file = event.target.files?.[0] || null;

    setError("");
    setResumeFile(null);

    if (!file) return;

    const isPdf =
      file.type === "application/pdf" &&
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setError("Please select a PDF resume.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_RESUME_SIZE) {
      setError("Your resume must be 5 MB or smaller.");
      event.target.value = "";
      return;
    }

    setResumeFile(file);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (submitting) return;

    setError("");
    setSuccess("");

    const cleanName = fullName.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();
    const cleanCoverLetter = coverLetter.trim();

    if (cleanName.length < 2 || cleanName.length > 100) {
      setError("Enter a name between 2 and 100 characters.");
      return;
    }

    if (
      cleanEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
    ) {
      setError("Enter a valid email address.");
      return;
    }

    const phoneDigits = cleanPhone.replace(/\D/g, "");

    if (
      phoneDigits.length < 10 ||
      phoneDigits.length > 15 ||
      !/^[+\d\s().-]+$/.test(cleanPhone)
    ) {
      setError("Enter a valid phone number containing 10–15 digits.");
      return;
    }

    if (!resumeFile) {
      setError("Please upload your PDF resume.");
      return;
    }

    if (cleanCoverLetter && cleanCoverLetter.length > 3000) {
      setError("Your cover letter must be 3,000 characters or fewer.");
      return;
    }

    if (!job?.title || !job?.company || !job?.location) {
      setError(
        "Internship details are incomplete. Return to the jobs page and select an internship again."
      );
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();

      formData.append("jobTitle", job.title);
      formData.append("company", job.company);
      formData.append("location", job.location);
      formData.append(
        "category",
        job.category || job.type || "Engineering"
      );
      formData.append("fullName", cleanName);
      formData.append("email", cleanEmail);
      formData.append("phone", cleanPhone);
      if (cleanCoverLetter) {
        formData.append("coverLetter", cleanCoverLetter);
      }
      formData.append("resume", resumeFile);

      const jobId = job._id || job.id;

      if (jobId && /^[0-9a-fA-F]{24}$/.test(jobId)) {
        formData.append("job", jobId);
      }

      const result = await submitApplication(formData);

      setSuccess(
        result?.message ||
          "Your application was submitted successfully!"
      );

      if (result?.application?.status) {
        setSavedStatus(result.application.status);
      }
    } catch (err) {
      const message = err?.message || "";

      if (
        err?.status === 401 ||
        message.toLowerCase().includes("log in") ||
        message.toLowerCase().includes("session has expired")
      ) {
        navigate("/login", {
          state: { from: "/apply", job },
        });
        return;
      }

      setError(
        message || "Unable to submit your application. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

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

  if (success) {
    return (
      <section className="application-page">
        <div className="application-card">
          <div className="success-badge">✓ SUCCESS</div>

          <h1>Application Submitted!</h1>

          <p className="auth-success" role="status">
            {success}
          </p>

          <div className="application-summary-card">
            <p>
              <strong>Internship:</strong> {job.title}
            </p>
            <p>
              <strong>Company:</strong> {job.company}
            </p>
            <p>
              <strong>Location:</strong> {job.location}
            </p>
            <p>
              <strong>Resume:</strong> {resumeFile?.name}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                className={`status-tag status-${String(
                  savedStatus
                ).toLowerCase()}`}
              >
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
        <Link to="/jobs" className="back-link">
          ← Back to jobs
        </Link>

        <p className="page-label">INTERNSHIP APPLICATION</p>

        <h1>Apply for {job.title}</h1>

        <p>
          <strong>{job.company}</strong>
          {job.location ? ` · ${job.location}` : ""}
        </p>

        <p>Complete the form below to submit your application.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="application-name">Full name</label>
            <input
              id="application-name"
              name="fullName"
              type="text"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Enter your full name"
              autoComplete="name"
              minLength={2}
              maxLength={100}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="application-email">Email address</label>
            <input
              id="application-email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              maxLength={254}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="application-phone">Phone number</label>
            <input
              id="application-phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Enter your phone number"
              autoComplete="tel"
              maxLength={25}
              aria-describedby="phone-help"
              required
            />
            <small id="phone-help">
              Include your country code if needed.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="application-resume">
              Resume (PDF only, maximum 5 MB)
            </label>
            <input
              id="application-resume"
              name="resume"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleResumeChange}
              aria-describedby="resume-help"
              required
            />
            <small id="resume-help">
              {resumeFile
                ? `Selected: ${resumeFile.name} (${(
                    resumeFile.size /
                    (1024 * 1024)
                  ).toFixed(2)} MB)`
                : "Upload your resume as a PDF file."}
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="application-cover-letter">
              Cover letter (optional)
            </label>
            <textarea
              id="application-cover-letter"
              name="coverLetter"
              value={coverLetter}
              onChange={(event) => setCoverLetter(event.target.value)}
              placeholder="Tell the employer why you're a good fit (optional)..."
              rows={5}
              maxLength={3000}
              aria-describedby="cover-letter-count"
            />
            <small id="cover-letter-count">
              {coverLetter.length}/3000 characters
            </small>
          </div>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="primary-button contact-button"
            disabled={submitting}
          >
            {submitting
              ? "Uploading resume and submitting..."
              : "Submit Application →"}
          </button>
        </form>
      </div>
    </section>
  );
}
