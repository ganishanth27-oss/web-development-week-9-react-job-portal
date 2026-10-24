import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyApplications, getJobs } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { calculateSkillMatch } from "../utils/matching";

import Sidebar from "../components/Sidebar";
import DashboardStatCard from "../components/DashboardStatCard";
import StatusBadge from "../components/StatusBadge";
import SkeletonLoader from "../components/SkeletonLoader";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import ApplicationModal from "../components/ApplicationModal";
import JobCard from "../components/JobCard";

const EMPTY_STATS = {
  total: 0,
  pending: 0,
  shortlisted: 0,
  interview: 0,
  selected: 0,
  rejected: 0,
};

function formatDate(date) {
  if (!date) return "Recently";
  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "Recently";
  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

const STAGES = [
  { key: "applied", label: "Applied" },
  { key: "review", label: "Under Review" },
  { key: "shortlisted", label: "Shortlisted" },
  { key: "interview", label: "Interview" },
  { key: "final", label: "Selected / Rejected" },
];

function getStageIndex(status = "") {
  const s = status.toLowerCase();
  if (s === "pending" || s === "applied") return 0;
  if (s === "under review" || s === "reviewed") return 1;
  if (s === "shortlisted") return 2;
  if (s === "interview") return 3;
  if (s === "selected" || s === "accepted" || s === "rejected") return 4;
  return 0;
}

export default function CandidateDashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchDashboard = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError("");

    try {
      const [appRes, jobRes] = await Promise.all([
        getMyApplications({ page: 1, limit: 5 }),
        getJobs({ limit: 4, sort: "newest" }),
      ]);

      if (appRes?.success) {
        const apps = appRes.applications || [];
        setApplications(apps);

        const s = appRes.stats || {};
        setStats({
          total: Number(s.total) || apps.length,
          pending: Number(s.pending) || 0,
          shortlisted: Number(s.shortlisted) || 0,
          interview: Number(s.interview) || 0,
          selected: Number(s.selected ?? s.accepted) || 0,
          rejected: Number(s.rejected) || 0,
        });
      }

      if (jobRes?.success) {
        setRecommendedJobs(jobRes.jobs || []);
      }
    } catch (err) {
      if (err.status === 401) {
        navigate("/login", {
          state: { from: "/dashboard" },
          replace: true,
        });
        return;
      }
      setError("Unable to load dashboard data. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (authLoading) return;
    if (!isAuthenticated) {
      navigate("/login", { state: { from: "/dashboard" }, replace: true });
      return;
    }
    fetchDashboard();
  }, [authLoading, isAuthenticated, fetchDashboard, navigate]);

  const candidateName = user?.name || "Candidate";

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 70px)" }}>
      {/* SIDEBAR NAVIGATION */}
      <Sidebar />

      {/* MAIN DASHBOARD CONTENT */}
      <main style={{ flex: 1, padding: "2rem", overflowX: "hidden" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* WELCOME SECTION */}
          <section className="dashboard-welcome">
            <div className="welcome-text">
              <p className="dashboard-eyebrow">CANDIDATE DASHBOARD</p>
              <h1>Welcome back, {candidateName} 👋</h1>
              <p>
                Track your active applications, real-time stage progression, and skill-matched job recommendations.
              </p>
            </div>

            <div className="welcome-actions">
              <Link to="/jobs" className="app-primary-button">
                Explore Jobs →
              </Link>
            </div>
          </section>

          {/* ERROR STATE */}
          {error && (
            <ErrorMessage
              title="Dashboard Error"
              message={error}
              onRetry={fetchDashboard}
            />
          )}

          {/* STATISTICS OVERVIEW */}
          {loading ? (
            <SkeletonLoader count={4} height="120px" style={{ gridTemplateColumns: "repeat(4, 1fr)" }} />
          ) : (
            <section className="dashboard-stats" aria-label="Application statistics">
              <DashboardStatCard
                title="Total Applied"
                count={stats.total}
                caption="All submitted jobs"
                icon="💼"
                variant="total"
              />
              <DashboardStatCard
                title="Shortlisted"
                count={stats.shortlisted}
                caption="Advanced to review"
                icon="⭐"
                variant="shortlisted"
              />
              <DashboardStatCard
                title="Interviews"
                count={stats.interview}
                caption="Interview stage"
                icon="🎙️"
                variant="pending"
              />
              <DashboardStatCard
                title="Offers / Selected"
                count={stats.selected}
                caption="Successful applications"
                icon="🎉"
                variant="selected"
              />
            </section>
          )}

          {/* APPLICATION PROGRESSION PIPELINE */}
          <section
            style={{
              backgroundColor: "var(--color-surface, #1e293b)",
              borderRadius: "14px",
              padding: "1.5rem",
              border: "1px solid var(--color-border, #334155)",
              margin: "2rem 0",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "1.1rem", color: "var(--color-text, #f8fafc)" }}>
                  Application Progression Pipeline
                </h3>
                <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.85rem", color: "var(--color-text-muted, #94a3b8)" }}>
                  Standard recruitment stages: Applied → Under Review → Shortlisted → Interview → Selected / Rejected
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "0.5rem",
                padding: "1rem",
                background: "var(--color-bg, #0f172a)",
                borderRadius: "10px",
                overflowX: "auto",
              }}
            >
              {STAGES.map((stg, i) => (
                <div
                  key={stg.key}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    flex: 1,
                    minWidth: "140px",
                  }}
                >
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "50%",
                      backgroundColor: "var(--color-primary, #6366f1)",
                      color: "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "0.85rem",
                    }}
                  >
                    {i + 1}
                  </div>
                  <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--color-text, #f8fafc)" }}>
                    {stg.label}
                  </span>
                  {i < STAGES.length - 1 && (
                    <span style={{ color: "var(--color-border, #475569)", marginLeft: "auto" }}>→</span>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* RECENT APPLICATIONS */}
          <section className="dashboard-panel" style={{ marginBottom: "2.5rem" }}>
            <div className="dashboard-panel-heading">
              <div>
                <p className="dashboard-eyebrow">YOUR PROGRESS</p>
                <h2>Recent Applications</h2>
                <p>Track current status and submission details.</p>
              </div>

              <Link to="/my-applications" className="dashboard-text-link">
                View All Applications →
              </Link>
            </div>

            {loading ? (
              <SkeletonLoader count={3} height="80px" />
            ) : applications.length === 0 ? (
              <EmptyState
                icon="💼"
                title="No applications submitted yet"
                message="You haven't submitted any job or internship applications yet. Browse open opportunities to begin!"
                actionText="Explore Jobs →"
                actionLink="/jobs"
              />
            ) : (
              <div className="dashboard-table-container">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Job Opportunity</th>
                      <th>Applied Date</th>
                      <th>Current Stage</th>
                      <th>Stage Progress</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => {
                      const stageIdx = getStageIndex(app.status);
                      const isRejected = app.status === "Rejected";
                      return (
                        <tr key={app._id}>
                          <td>
                            <div className="dashboard-job-title">{app.jobTitle}</div>
                            <div className="dashboard-job-company">
                              {app.company} · {app.location}
                            </div>
                          </td>
                          <td>{formatDate(app.createdAt)}</td>
                          <td>
                            <StatusBadge status={app.status} />
                          </td>
                          <td style={{ minWidth: "150px" }}>
                            <div
                              style={{
                                width: "100%",
                                height: "6px",
                                background: "var(--color-border, #334155)",
                                borderRadius: "3px",
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  height: "100%",
                                  width: `${((stageIdx + 1) / 5) * 100}%`,
                                  backgroundColor: isRejected
                                    ? "var(--color-danger, #ef4444)"
                                    : "var(--color-primary, #6366f1)",
                                  transition: "width 0.3s ease",
                                }}
                              />
                            </div>
                            <span style={{ fontSize: "0.75rem", color: "var(--color-text-muted, #94a3b8)" }}>
                              Stage {stageIdx + 1} of 5 ({app.status})
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="dashboard-view-button"
                              onClick={() => setSelectedApp(app)}
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* AI / SKILL-BASED RECOMMENDED JOBS */}
          <section className="dashboard-panel">
            <div className="dashboard-panel-heading">
              <div>
                <p className="dashboard-eyebrow">SKILL MATCHING</p>
                <h2>Recommended For You</h2>
                <p>Based on your profile skills and job requirements.</p>
              </div>

              <Link to="/jobs" className="dashboard-text-link">
                Browse All →
              </Link>
            </div>

            {recommendedJobs.length > 0 ? (
              <div className="jobs-grid">
                {recommendedJobs.slice(0, 3).map((job) => (
                  <JobCard
                    key={job._id || job.id}
                    _id={job._id || job.id}
                    title={job.title}
                    company={job.company}
                    location={job.location}
                    type={job.type}
                    category={job.category || job.type}
                    skills={job.skills}
                    description={job.description}
                    salary={job.salary}
                    deadline={job.deadline}
                    showMatch={true}
                  />
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--color-text-muted)" }}>No recommendations available right now.</p>
            )}
          </section>
        </div>
      </main>

      {/* APPLICATION DETAILS MODAL */}
      <ApplicationModal
        isOpen={Boolean(selectedApp)}
        onClose={() => setSelectedApp(null)}
        application={selectedApp}
      />
    </div>
  );
}
