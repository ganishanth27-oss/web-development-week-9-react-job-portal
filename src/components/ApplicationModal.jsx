import { useEffect } from "react";
import { Link } from "react-router-dom";
import StatusBadge from "./StatusBadge";

export default function ApplicationModal({ application, onClose }) {
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "Escape") {
        onClose();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!application) return null;

  const jobId = application.job?._id || application.job?.id || application.job;
  const appliedDate = application.createdAt
    ? new Date(application.createdAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Recently";

  return (
    <div
      className="app-modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-app-title"
    >
      <div
        className="app-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="app-modal-header">
          <div>
            <span className="app-modal-eyebrow">APPLICATION DETAILS</span>
            <h2 id="modal-app-title">
              {application.jobTitle || application.job?.title || "Internship Application"}
            </h2>
            <p className="app-modal-company">
              {application.company || application.job?.company || "Company"}
              {application.location ? ` · ${application.location}` : ""}
            </p>
          </div>
          <button
            type="button"
            className="app-modal-close"
            onClick={onClose}
            aria-label="Close details"
          >
            ✕
          </button>
        </div>

        <div className="app-modal-body">
          <div className="app-modal-status-row">
            <span>Current Status:</span>
            <StatusBadge status={application.status} />
          </div>

          <div className="app-modal-grid">
            <div className="modal-info-item">
              <span className="info-label">Applied Date</span>
              <span className="info-value">{appliedDate}</span>
            </div>

            <div className="modal-info-item">
              <span className="info-label">Category</span>
              <span className="info-value">
                {application.category || "General"}
              </span>
            </div>

            <div className="modal-info-item">
              <span className="info-label">Applicant Name</span>
              <span className="info-value">
                {application.fullName || "Candidate"}
              </span>
            </div>

            <div className="modal-info-item">
              <span className="info-label">Email</span>
              <span className="info-value">{application.email}</span>
            </div>

            <div className="modal-info-item">
              <span className="info-label">Phone</span>
              <span className="info-value">{application.phone}</span>
            </div>

            <div className="modal-info-item">
              <span className="info-label">Resume</span>
              <span className="info-value">
                {application.resumeUrl ? (
                  <a
                    href={application.resumeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="modal-resume-link"
                  >
                    View Submitted Resume ↗
                  </a>
                ) : (
                  "Not attached"
                )}
              </span>
            </div>
          </div>

          {application.coverLetter && (
            <div className="modal-cover-letter">
              <span className="info-label">Cover Letter</span>
              <p>{application.coverLetter}</p>
            </div>
          )}
        </div>

        <div className="app-modal-footer">
          {jobId && typeof jobId === "string" && (
            <Link
              to={`/jobs/${jobId}`}
              className="app-secondary-button"
              onClick={onClose}
            >
              View Job Posting →
            </Link>
          )}
          <button
            type="button"
            className="app-primary-button"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
