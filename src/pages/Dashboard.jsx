import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyApplications } from "../api";
import { useAuth } from "../context/AuthContext";

import DashboardStatCard from "../components/DashboardStatCard";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import ApplicationModal from "../components/ApplicationModal";

const EMPTY_STATS = {
  total: 0,
  pending: 0,
  shortlisted: 0,
  selected: 0,
  rejected: 0,
};

function formatDate(date) {
  if (!date) return "Recently";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Recently";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Calculates internally consistent statistics across the candidate's applications.
 * Status Grouping:
 * - Pending: "Pending", "Applied"
 * - Shortlisted: "Shortlisted", "Reviewed", "Under Review"
 * - Selected: "Selected", "Accepted"
 * - Rejected: "Rejected"
 * - Total: Sum of all applications
 */
function parseStats(statsFromApi, applicationsList = []) {
  if (statsFromApi && typeof statsFromApi.total === "number") {
    const pending = Number(statsFromApi.pending) || 0;
    const shortlisted =
      Number(statsFromApi.shortlisted ?? statsFromApi.reviewed) || 0;
    const selected =
      Number(statsFromApi.selected ?? statsFromApi.accepted) || 0;
    const rejected = Number(statsFromApi.rejected) || 0;
    const total =
      Number(statsFromApi.total) ||
      pending + shortlisted + selected + rejected;

    return { total, pending, shortlisted, selected, rejected };
  }

  // Fallback: derive directly from applications array
  const counts = { ...EMPTY_STATS, total: applicationsList.length };
  for (const app of applicationsList) {
    const s = String(app.status || "").trim().toLowerCase();
    if (s === "pending" || s === "applied") {
      counts.pending += 1;
    } else if (
      s === "shortlisted" ||
      s === "reviewed" ||
      s === "under review"
    ) {
      counts.shortlisted += 1;
    } else if (s === "selected" || s === "accepted") {
      counts.selected += 1;
    } else if (s === "rejected") {
      counts.rejected += 1;
    } else {
      counts.pending += 1;
    }
  }
  return counts;
}

export default function Dashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);

  const fetchDashboard = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError("");

    try {
      const response = await getMyApplications({
        page: 1,
        limit: 5,
      });

      if (!response?.success) {
        throw new Error(
          response?.message || "Unable to load dashboard data. Please try again."
        );
      }

      const apps = response.applications || [];
      setApplications(apps);
      setStats(parseStats(response.stats, apps));
    } catch (err) {
      if (err.status === 401) {
        navigate("/login", {
          state: { from: "/dashboard" },
          replace: true,
        });
        return;
      }

      setError("Unable to load dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      navigate("/login", {
        state: { from: "/dashboard" },
        replace: true,
      });
      return;
    }

    fetchDashboard();
  }, [authLoading, isAuthenticated, fetchDashboard, navigate]);

  if (authLoading || (loading && isAuthenticated)) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-container">
          <LoadingSpinner message="Loading your dashboard..." fullHeight />
        </div>
      </main>
    );
  }

  const candidateName =
    user?.name ||
    user?.fullName ||
    user?.email?.split("@")[0] ||
    "Candidate";

  return (
    <main className="dashboard-page">
      <div className="dashboard-container">
        {/* WELCOME SECTION */}
        <section className="dashboard-welcome">
          <div className="welcome-text">
            <p className="dashboard-eyebrow">CANDIDATE DASHBOARD</p>
            <h1>Welcome back, {candidateName}</h1>
            <p>
              Track your internship applications, view real-time status updates,
              and explore new career opportunities.
            </p>
          </div>

          <div className="welcome-actions">
            <Link to="/jobs" className="app-primary-button">
              Explore Internships <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        {/* ERROR STATE WITH RETRY */}
        {error && (
          <ErrorMessage
            title="Dashboard Error"
            message={error}
            onRetry={fetchDashboard}
            retryLabel="Retry"
          />
        )}

        {/* FIVE APPLICATION STATISTICS CARDS */}
        <section
          className="dashboard-stats"
          aria-label="Application statistics overview"
        >
          <DashboardStatCard
            title="Total Applications"
            count={stats.total}
            caption="All submitted applications"
            icon="▤"
            variant="total"
          />

          <DashboardStatCard
            title="Pending"
            count={stats.pending}
            caption="Awaiting review"
            icon="◷"
            variant="pending"
          />

          <DashboardStatCard
            title="Shortlisted"
            count={stats.shortlisted}
            caption="Advanced to next stage"
            icon="★"
            variant="shortlisted"
          />

          <DashboardStatCard
            title="Selected"
            count={stats.selected}
            caption="Offers & acceptances"
            icon="✓"
            variant="selected"
          />

          <DashboardStatCard
            title="Rejected"
            count={stats.rejected}
            caption="Not moving forward"
            icon="✕"
            variant="rejected"
          />
        </section>

        {/* RECENT APPLICATIONS PANEL */}
        <section className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <p className="dashboard-eyebrow">YOUR PROGRESS</p>
              <h2>Recent Applications</h2>
              <p>Here are your most recent internship applications.</p>
            </div>

            <Link to="/my-applications" className="dashboard-text-link">
              View All Applications <span aria-hidden="true">→</span>
            </Link>
          </div>

          {applications.length === 0 ? (
            <EmptyState
              icon="💼"
              title="No applications submitted yet"
              message="You haven't submitted any internship applications yet. Explore our open positions and start applying today!"
              actionText="Browse Jobs →"
              actionLink="/jobs"
            />
          ) : (
            <>
              {/* DESKTOP & TABLET TABLE */}
              <div className="dashboard-table-wrapper">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th scope="col">Job</th>
                      <th scope="col">Company</th>
                      <th scope="col">Applied</th>
                      <th scope="col">Status</th>
                      <th scope="col">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {applications.map((app) => {
                      const id = app._id || app.id;
                      const jobTitle =
                        app.jobTitle || app.job?.title || "Untitled Internship";
                      const company =
                        app.company || app.job?.company || "Company";

                      return (
                        <tr key={id}>
                          <td className="col-job">
                            <strong className="table-job-title">{jobTitle}</strong>
                            {app.category && (
                              <span className="table-job-cat">
                                {app.category}
                              </span>
                            )}
                          </td>
                          <td className="col-company">
                            <span>{company}</span>
                            {app.location && (
                              <small className="table-job-loc">
                                📍 {app.location}
                              </small>
                            )}
                          </td>
                          <td className="col-date">
                            {formatDate(app.createdAt)}
                          </td>
                          <td className="col-status">
                            <StatusBadge status={app.status} />
                          </td>
                          <td className="col-action">
                            <button
                              type="button"
                              className="table-action-button"
                              onClick={() => setSelectedApp(app)}
                              aria-label={`View details for ${jobTitle} at ${company}`}
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

              {/* MOBILE CARDS VIEW */}
              <div className="dashboard-mobile-cards">
                {applications.map((app) => {
                  const id = app._id || app.id;
                  const jobTitle =
                    app.jobTitle || app.job?.title || "Untitled Internship";
                  const company =
                    app.company || app.job?.company || "Company";

                  return (
                    <div key={`m-${id}`} className="dashboard-app-card">
                      <div className="app-card-top">
                        <div>
                          <strong className="mobile-job-title">{jobTitle}</strong>
                          <p className="mobile-company">{company}</p>
                        </div>
                        <StatusBadge status={app.status} />
                      </div>

                      <div className="app-card-details">
                        {app.location && <span>📍 {app.location}</span>}
                        <span>📅 Applied {formatDate(app.createdAt)}</span>
                      </div>

                      <div className="app-card-actions">
                        <button
                          type="button"
                          className="table-action-button full-width"
                          onClick={() => setSelectedApp(app)}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </section>

        {/* CANDIDATE QUICK TIPS */}
        <section className="dashboard-tip">
          <span className="dashboard-tip-icon" aria-hidden="true">
            💡
          </span>
          <div>
            <h3>Candidate Success Tip</h3>
            <p>
              Keep your profile updated with recent skills and customize your
              cover letter for each internship to increase your shortlist chances.
            </p>
          </div>
          <Link to="/profile" className="app-secondary-button">
            Update Profile →
          </Link>
        </section>
      </div>

      {/* VIEW DETAILS MODAL */}
      {selectedApp && (
        <ApplicationModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </main>
  );
}
