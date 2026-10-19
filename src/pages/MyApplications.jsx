import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMyApplications } from "../api";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import ApplicationModal from "../components/ApplicationModal";

export default function MyApplications() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedApp, setSelectedApp] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [currentPage, setCurrentPage] = useState(1);

  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const fetchApplications = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError("");

    try {
      const res = await getMyApplications({ page: currentPage, limit: 10 });
      if (res?.success) {
        setApplications(res.applications || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else {
        setApplications([]);
      }
    } catch (err) {
      if (err.status === 401) {
        navigate("/login", { state: { from: "/my-applications" } });
        return;
      }
      setError(err.message || "Unable to load applications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, currentPage, navigate]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { state: { from: "/my-applications" } });
      return;
    }

    if (isAuthenticated) {
      fetchApplications();
    }
  }, [authLoading, isAuthenticated, fetchApplications, navigate]);

  if (authLoading) {
    return (
      <section className="applications-page">
        <LoadingSpinner message="Verifying authentication..." fullHeight />
      </section>
    );
  }

  return (
    <div className="my-applications-page">
      <section className="jobs-hero">
        <p className="page-label">CANDIDATE PORTAL</p>
        <h1>My Applications</h1>
        <p>Track the progress and status of your submitted internship applications.</p>
      </section>

      <section className="applications-container">
        {/* LOADING STATE */}
        {loading && (
          <LoadingSpinner message="Loading your applications..." />
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <ErrorMessage
            title="Applications Error"
            message={error}
            onRetry={fetchApplications}
            retryLabel="Retry"
          />
        )}

        {/* EMPTY STATE */}
        {!loading && !error && applications.length === 0 && (
          <EmptyState
            icon="📂"
            title="No applications submitted yet"
            message="You haven't applied to any internships yet. Explore open roles and take the next step in your career!"
            actionText="Browse Jobs →"
            actionLink="/jobs"
          />
        )}

        {/* APPLICATIONS LIST / TABLE */}
        {!loading && !error && applications.length > 0 && (
          <div className="applications-list-wrapper">
            <div className="applications-meta-header">
              <span>
                Total Applications:{" "}
                <strong>{pagination.totalCount || applications.length}</strong>
              </span>
            </div>

            <div className="applications-cards-grid">
              {applications.map((app) => {
                const appId = app._id || app.id;
                const formattedDate = app.createdAt
                  ? new Date(app.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })
                  : "Recently";

                return (
                  <div key={appId} className="application-record-card">
                    <div className="app-card-header">
                      <div>
                        <h3>{app.jobTitle}</h3>
                        <p className="app-card-company">{app.company}</p>
                      </div>
                      <StatusBadge status={app.status} />
                    </div>

                    <div className="app-card-meta">
                      {app.location && <span>📍 {app.location}</span>}
                      <span>📅 Applied on {formattedDate}</span>
                      {app.category && <span>💼 {app.category}</span>}
                    </div>

                    <div className="app-card-footer">
                      <button
                        type="button"
                        className="app-secondary-button-sm"
                        onClick={() => setSelectedApp(app)}
                      >
                        View Details
                      </button>

                      {app.resumeUrl && (
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="resume-link"
                        >
                          View Resume ↗
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINATION */}
            {pagination.totalPages > 1 && (
              <div className="pagination-bar">
                <button
                  type="button"
                  className="page-nav-button"
                  disabled={!pagination.hasPrevPage}
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                >
                  ← Previous
                </button>

                <div className="page-numbers">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={currentPage === num ? "page-num active" : "page-num"}
                      onClick={() => setCurrentPage(num)}
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="page-nav-button"
                  disabled={!pagination.hasNextPage}
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))
                  }
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        )}
      </section>

      {/* VIEW DETAILS MODAL */}
      {selectedApp && (
        <ApplicationModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
        />
      )}
    </div>
  );
}
