import React, { memo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { calculateSkillMatch } from "../utils/matching";

function JobCard({
  _id,
  id,
  icon = "💼",
  title,
  company,
  location,
  type = "Internship",
  category,
  skills = [],
  description,
  salary,
  deadline,
  showMatch = true,
}) {
  const navigate = useNavigate();
  const { isAuthenticated, user, isCandidate } = useAuth();
  const jobId = _id || id;

  const matchData = showMatch && isCandidate && user
    ? calculateSkillMatch(user, { skills, title })
    : null;

  const handleApply = () => {
    const jobPayload = {
      _id: jobId,
      id: jobId,
      icon: icon || "💼",
      title,
      company,
      location,
      type,
      category: category || "Engineering",
      skills,
      description,
    };

    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: "/apply",
          job: jobPayload,
        },
      });
      return;
    }

    navigate("/apply", {
      state: {
        job: jobPayload,
      },
    });
  };

  const formattedDeadline = deadline
    ? new Date(deadline).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="job-card">
      <div className="job-top">
        <div className="job-icon">{icon}</div>
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
          {matchData && (
            <span
              className="match-badge"
              title={matchData.reason}
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                padding: "0.25rem 0.6rem",
                borderRadius: "12px",
                backgroundColor:
                  matchData.score >= 80
                    ? "rgba(34, 197, 94, 0.15)"
                    : matchData.score >= 60
                    ? "rgba(234, 179, 8, 0.15)"
                    : "rgba(148, 163, 184, 0.15)",
                color:
                  matchData.score >= 80
                    ? "#22c55e"
                    : matchData.score >= 60
                    ? "#eab308"
                    : "#94a3b8",
                border: "1px solid currentColor",
              }}
            >
              ⚡ {matchData.score}% Match
            </span>
          )}
          <span className="job-type">{type}</span>
        </div>
      </div>

      <h3>
        <button
          type="button"
          className="job-title-link"
          onClick={() => navigate(`/jobs/${jobId}`)}
          disabled={!jobId}
        >
          {title}
        </button>
      </h3>
      <p className="job-company">{company}</p>

      <div className="job-details">
        <span>📍 {location}</span>
        {category && <span>💼 {category}</span>}
        {salary?.max ? (
          <span>
            💰 ₹{salary.min ? `${salary.min.toLocaleString()} - ` : ""}
            {salary.max.toLocaleString()}
          </span>
        ) : null}
        {formattedDeadline && <span>⏳ Due: {formattedDeadline}</span>}
      </div>

      <p className="job-description">{description}</p>

      {matchData?.reason && (
        <div
          style={{
            fontSize: "0.78rem",
            color: "var(--color-text-muted, #94a3b8)",
            backgroundColor: "rgba(255, 255, 255, 0.03)",
            padding: "0.4rem 0.6rem",
            borderRadius: "6px",
            marginBottom: "0.75rem",
            borderLeft: "3px solid var(--color-primary, #6366f1)",
          }}
        >
          <strong>Match reason:</strong> {matchData.reason}
        </div>
      )}

      {Array.isArray(skills) && skills.length > 0 && (
        <div className="job-skills-tags">
          {skills.map((skill, idx) => (
            <span key={idx} className="job-skill-pill">
              {skill}
            </span>
          ))}
        </div>
      )}

      <button type="button" className="apply-button" onClick={handleApply}>
        Apply Now →
      </button>
    </div>
  );
}

export default memo(JobCard);