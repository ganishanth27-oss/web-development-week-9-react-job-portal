import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getJobById } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { calculateSkillMatch } from "../utils/matching";
import SkeletonLoader from "../components/SkeletonLoader";
import ErrorMessage from "../components/ErrorMessage";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user, isCandidate } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadJob = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getJobById(id);
      const jobData = response?.job ?? response?.data ?? response;

      if (!jobData || !(jobData._id || jobData.id)) {
        throw new Error("Job details could not be found.");
      }

      setJob(jobData);
    } catch (err) {
      setError(err.message || "Unable to load this opportunity.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJob();
  }, [id]);

  const matchData = useMemo(() => {
    if (!job || !isCandidate || !user) return null;
    return calculateSkillMatch(user, job);
  }, [job, user, isCandidate]);

  function handleApply() {
    if (!job) return;

    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: "/apply",
          job,
        },
      });
      return;
    }

    navigate("/apply", { state: { job } });
  }

  if (loading) {
    return (
      <section className="page-container job-details-page" style={{ padding: "3rem 1rem", maxWidth: "800px", margin: "0 auto" }}>
        <SkeletonLoader count={4} height="60px" />
      </section>
    );
  }

  if (error || !job) {
    return (
      <section className="page-container job-details-page" style={{ padding: "3rem 1rem", maxWidth: "800px", margin: "0 auto" }}>
        <ErrorMessage
          title="Job Details Unavailable"
          message={error || "This opportunity could not be found or may have expired."}
          onRetry={loadJob}
        />
        <div style={{ marginTop: "1rem" }}>
          <Link to="/jobs" className="secondary-button">
            ← Back to Jobs
          </Link>
        </div>
      </section>
    );
  }

  const skills = Array.isArray(job.skills) ? job.skills : [];
  const salary = job.salary;

  return (
    <section className="page-container job-details-page" style={{ padding: "2rem 1rem", maxWidth: "900px", margin: "0 auto" }}>
      <Link to="/jobs" className="back-link" style={{ display: "inline-block", marginBottom: "1.5rem", color: "var(--color-primary, #818cf8)" }}>
        ← Back to Jobs
      </Link>

      <article className="job-details-card" style={{ backgroundColor: "var(--color-surface, #1e293b)", padding: "2rem", borderRadius: "16px", border: "1px solid var(--color-border, #334155)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span className="job-type" style={{ padding: "0.25rem 0.75rem", borderRadius: "12px", fontSize: "0.8rem", fontWeight: 700, backgroundColor: "rgba(99, 102, 241, 0.2)", color: "#818cf8" }}>
              {job.type || "Internship"}
            </span>
            <h1 style={{ margin: "0.75rem 0 0.25rem 0", color: "var(--color-text, #f8fafc)", fontSize: "1.8rem" }}>
              {job.title}
            </h1>
            <h2 style={{ margin: 0, color: "var(--color-text-muted, #94a3b8)", fontSize: "1.1rem", fontWeight: 500 }}>
              {job.company}
            </h2>
          </div>

          {matchData && (
            <div
              style={{
                textAlign: "right",
                background: "var(--color-bg, #0f172a)",
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                border: "1px solid var(--color-border, #334155)",
              }}
            >
              <div
                style={{
                  fontSize: "1.2rem",
                  fontWeight: 800,
                  color: matchData.score >= 80 ? "#22c55e" : matchData.score >= 60 ? "#eab308" : "#94a3b8",
                }}
              >
                ⚡ {matchData.score}% Skill Match
              </div>
              <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted, #94a3b8)", marginTop: "0.2rem" }}>
                Based on your profile skills
              </div>
            </div>
          )}
        </div>

        <div className="job-details" style={{ display: "flex", flexWrap: "wrap", gap: "1.25rem", margin: "1.5rem 0", color: "var(--color-text-muted, #94a3b8)", fontSize: "0.95rem" }}>
          <span>📍 {job.location || "Location not specified"}</span>
          {job.category && <span>💼 {job.category}</span>}
          {job.deadline && (
            <span>
              ⏳ Deadline: {new Date(job.deadline).toLocaleDateString()}
            </span>
          )}
          {salary?.max != null && (
            <span>
              💰 Salary: ₹
              {salary.min != null
                ? `${Number(salary.min).toLocaleString()} - `
                : ""}
              {Number(salary.max).toLocaleString()}
            </span>
          )}
        </div>

        {/* AI Skill Matching Explanation Breakdown */}
        {matchData && (
          <div
            style={{
              padding: "1rem",
              borderRadius: "10px",
              backgroundColor: "rgba(99, 102, 241, 0.08)",
              border: "1px solid rgba(99, 102, 241, 0.25)",
              marginBottom: "1.5rem",
            }}
          >
            <strong style={{ color: "var(--color-text, #f8fafc)", fontSize: "0.9rem" }}>
              💡 Why This Opportunity Matches:
            </strong>
            <p style={{ margin: "0.35rem 0 0.5rem 0", fontSize: "0.85rem", color: "var(--color-text-muted, #94a3b8)" }}>
              {matchData.reason}
            </p>
            {matchData.matchedSkills.length > 0 && (
              <div style={{ fontSize: "0.8rem", color: "var(--color-success, #22c55e)" }}>
                ✓ Matched skills: {matchData.matchedSkills.join(", ")}
              </div>
            )}
            {matchData.missingSkills.length > 0 && (
              <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted, #94a3b8)", marginTop: "0.25rem" }}>
                ○ Additional skills desired: {matchData.missingSkills.join(", ")}
              </div>
            )}
          </div>
        )}

        <h3 style={{ color: "var(--color-text, #f8fafc)", marginBottom: "0.5rem" }}>
          About this opportunity
        </h3>
        <p style={{ color: "var(--color-text-muted, #94a3b8)", lineHeight: 1.6, whiteSpace: "pre-line" }}>
          {job.description || "No description provided."}
        </p>

        <h3 style={{ color: "var(--color-text, #f8fafc)", margin: "1.5rem 0 0.5rem 0" }}>
          Required Skills
        </h3>
        {skills.length > 0 ? (
          <div className="job-skills-tags" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2rem" }}>
            {skills.map((skill, index) => (
              <span className="job-skill-pill" key={`${skill}-${index}`}>
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p style={{ color: "var(--color-text-muted)" }}>No specific skills listed.</p>
        )}

        <button
          type="button"
          className="app-primary-button"
          onClick={handleApply}
          style={{ width: "100%", padding: "0.9rem", fontSize: "1rem", fontWeight: 700 }}
        >
          Apply for this Opportunity →
        </button>
      </article>
    </section>
  );
}

export default JobDetails;
