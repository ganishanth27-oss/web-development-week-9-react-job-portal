
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyApplications } from "../api";
import { useAuth } from "../context/AuthContext";

const STATUS_STYLES = {
  Pending: "status-pending",
  Reviewed: "status-reviewed",
  Accepted: "status-accepted",
  Rejected: "status-rejected",
};

const EMPTY_STATS = {
  total: 0,
  pending: 0,
  reviewed: 0,
  accepted: 0,
  rejected: 0,
};

function formatDate(date) {
  if (!date) return "Date unavailable";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Date unavailable";
  }

  return parsedDate.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Dashboard() {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
          response?.message || "Unable to load your dashboard."
        );
      }

      setApplications(response.applications || []);

      // Use complete backend statistics, not just the five recent records.
      if (response.stats) {
        setStats({
          total: Number(response.stats.total) || 0,
          pending: Number(response.stats.pending) || 0,
          reviewed: Number(response.stats.reviewed) || 0,
          accepted: Number(response.stats.accepted) || 0,
          rejected: Number(response.stats.rejected) || 0,
        });
      } else {
        // Fallback for a backend that has not been updated yet.
        const paginationTotal = response.pagination?.totalCount;
        setStats({
          ...EMPTY_STATS,
          total:
            typeof paginationTotal === "number"
              ? paginationTotal
              : (response.applications || []).length,
        });
      }
    } catch (err) {
      if (err.status === 401) {
        navigate("/login", {
          state: { from: "/dashboard" },
          replace: true,
        });
        return;
      }

      setError(err.message || "Unable to load your dashboard.");
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
        <div className="dashboard-message">
          <div className="dashboard-spinner" />
          <p>Loading your dashboard...</p>
        </div>
      </main>
    );
  }

  const displayName =
    user?.fullName ||
    user?.name ||
    user?.username ||
    user?.email?.split("@")[0] ||
    "Candidate";

  return (
    <main className="dashboard-page">
      <div className="dashboard-container">
        <section className="dashboard-welcome">
          <div>
            <p className="dashboard-eyebrow">CANDIDATE PORTAL</p>
            <h1>Welcome back, {displayName}!</h1>
            <p>
              Keep track of your applications and take the next step
              in your career.
            </p>
          </div>

          <Link to="/jobs" className="dashboard-primary-button">
            Explore jobs <span aria-hidden="true">→</span>
          </Link>
        </section>

        {error && (
          <section className="dashboard-error" role="alert">
            <div>
              <strong>Unable to load your latest data</strong>
              <p>{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchDashboard}
              className="dashboard-retry-button"
            >
              Try again
            </button>
          </section>
        )}

        <section className="dashboard-stats" aria-label="Application statistics">
          <article className="dashboard-stat-card stat-total">
            <span className="stat-icon" aria-hidden="true">▤</span>
            <p>Total applications</p>
            <strong>{stats.total}</strong>
            <span className="stat-caption">All your submissions</span>
          </article>

          <article className="dashboard-stat-card stat-pending">
            <span className="stat-icon" aria-hidden="true">◷</span>
            <p>Pending</p>
            <strong>{stats.pending}</strong>
            <span className="stat-caption">Awaiting review</span>
          </article>

          <article className="dashboard-stat-card stat-accepted">
            <span className="stat-icon" aria-hidden="true">✓</span>
            <p>Accepted</p>
            <strong>{stats.accepted}</strong>
            <span className="stat-caption">Positive outcomes</span>
          </article>

          <article className="dashboard-stat-card stat-reviewed">
            <span className="stat-icon" aria-hidden="true">◉</span>
            <p>Reviewed</p>
            <strong>{stats.reviewed}</strong>
            <span className="stat-caption">Reviewed by employers</span>
          </article>

          <article className="dashboard-stat-card stat-rejected">
            <span className="stat-icon" aria-hidden="true">↗</span>
            <p>Rejected</p>
            <strong>{stats.rejected}</strong>
            <span className="stat-caption">Other opportunities await</span>
          </article>
        </section>

        <section className="dashboard-panel">
          <div className="dashboard-panel-heading">
            <div>
              <p className="dashboard-eyebrow">YOUR PROGRESS</p>
              <h2>Recent applications</h2>
              <p>Here are your five most recent submissions.</p>
            </div>

            <Link
              to="/my-applications"
              className="dashboard-text-link"
            >
              View all <span aria-hidden="true">→</span>
            </Link>
          </div>

          {error && applications.length === 0 ? (
            <div className="dashboard-empty">
              <p>Your application list could not be loaded.</p>
              <button
                type="button"
                onClick={fetchDashboard}
                className="dashboard-secondary-button"
              >
                Reload applications
              </button>
            </div>
          ) : applications.length === 0 ? (
            <div className="dashboard-empty">
              <div className="dashboard-empty-icon" aria-hidden="true">
                ♧
              </div>
              <h3>Your journey starts here</h3>
              <p>
                You haven't submitted any applications yet. Explore
                opportunities and apply for a role that matches your skills.
              </p>
              <Link to="/jobs" className="dashboard-primary-button">
                Find your first opportunity
              </Link>
            </div>
          ) : (
            <div className="dashboard-table-wrapper">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th scope="col">Position</th>
                    <th scope="col">Company</th>
                    <th scope="col">Applied on</th>
                    <th scope="col">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((application) => {
                    const id = application._id || application.id;
                    const status = application.status || "Pending";

                    return (
                      <tr key={id}>
                        <td>
                          <strong>
                            {application.jobTitle ||
                              application.job?.title ||
                              "Untitled position"}
                          </strong>
                        </td>
                        <td>
                          {application.company ||
                            application.job?.company ||
                            "Company unavailable"}
                        </td>
                        <td>{formatDate(application.createdAt)}</td>
                        <td>
                          <span
                            className={`dashboard-status ${
                              STATUS_STYLES[status] || "status-pending"
                            }`}
                          >
                            {status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="dashboard-tip">
          <span className="dashboard-tip-icon" aria-hidden="true">✦</span>
          <div>
            <h3>Keep moving forward</h3>
            <p>
              Continue exploring relevant internships, keep your profile
              up to date, and check your application statuses regularly.
            </p>
          </div>
          <Link to="/profile" className="dashboard-text-link">
            Update profile →
          </Link>
        </section>
      </div>
    </main>
  );
}
