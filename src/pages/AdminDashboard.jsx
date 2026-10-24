import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getAdminStats,
  getAdminUsers,
  getJobs,
  deleteJob,
  toggleUserStatus,
} from "../services/api";
import { useApp } from "../context/AppContext";

import Sidebar from "../components/Sidebar";
import DashboardStatCard from "../components/DashboardStatCard";
import SkeletonLoader from "../components/SkeletonLoader";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";

export default function AdminDashboard() {
  const { addToast } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  // Admin stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCandidates: 0,
    totalRecruiters: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    shortlistedApplications: 0,
    interviewApplications: 0,
    selectedApplications: 0,
    rejectedApplications: 0,
  });

  // User management state
  const [users, setUsers] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState("All");
  const [userSearch, setUserSearch] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userPagination, setUserPagination] = useState({ totalPages: 1, currentPage: 1 });

  // Jobs management state
  const [jobs, setJobs] = useState([]);
  const [jobPage, setJobPage] = useState(1);
  const [jobPagination, setJobPagination] = useState({ totalPages: 1, currentPage: 1 });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Confirmation modal
  const [deleteConfirmJob, setDeleteConfirmJob] = useState(null);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [statsRes, usersRes, jobsRes] = await Promise.all([
        getAdminStats(),
        getAdminUsers({
          role: userRoleFilter !== "All" ? userRoleFilter : undefined,
          search: userSearch.trim() || undefined,
          page: userPage,
          limit: 15,
        }),
        getJobs({
          page: jobPage,
          limit: 15,
        }),
      ]);

      if (statsRes?.success) {
        setStats(statsRes.stats);
      }
      if (usersRes?.success) {
        setUsers(usersRes.users || []);
        if (usersRes.pagination) {
          setUserPagination(usersRes.pagination);
        }
      }
      if (jobsRes?.success) {
        setJobs(jobsRes.jobs || []);
        if (jobsRes.pagination) {
          setJobPagination(jobsRes.pagination);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to load administrator data.");
    } finally {
      setLoading(false);
    }
  }, [userRoleFilter, userSearch, userPage, jobPage]);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  // Toggle user active status
  const handleToggleUser = async (userId, currentStatus) => {
    try {
      const res = await toggleUserStatus(userId, !currentStatus);
      if (res?.success) {
        addToast({ message: res.message || "User status updated.", type: "success" });
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isActive: !currentStatus } : u))
        );
      }
    } catch (err) {
      addToast({ message: err.message || "Failed to toggle user status.", type: "danger" });
    }
  };

  // Remove inappropriate job
  const handleDeleteJob = async () => {
    if (!deleteConfirmJob) return;
    try {
      await deleteJob(deleteConfirmJob._id);
      addToast({ message: "Job opportunity removed successfully.", type: "success" });
      setDeleteConfirmJob(null);
      fetchAdminData();
    } catch (err) {
      addToast({ message: err.message || "Failed to remove job.", type: "danger" });
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 70px)" }}>
      {/* SIDEBAR NAVIGATION */}
      <Sidebar />

      {/* ADMIN CONTENT */}
      <main style={{ flex: 1, padding: "2rem", overflowX: "hidden" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* HEADER */}
          <div style={{ marginBottom: "2rem" }}>
            <p className="dashboard-eyebrow">ADMINISTRATOR CONSOLE</p>
            <h1 style={{ margin: "0.25rem 0", color: "var(--color-text, #f8fafc)" }}>
              Platform Operations &amp; Governance
            </h1>
            <p style={{ margin: 0, color: "var(--color-text-muted, #94a3b8)" }}>
              Real-time platform metrics, user access controls, and job moderation.
            </p>
          </div>

          {error && <ErrorMessage message={error} onRetry={fetchAdminData} />}

          {/* OVERVIEW METRICS */}
          {loading ? (
            <SkeletonLoader count={5} height="120px" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }} />
          ) : (
            <section className="dashboard-stats" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
              <DashboardStatCard
                title="Total Users"
                count={stats.totalUsers}
                caption="Registered accounts"
                icon="👥"
                variant="total"
              />
              <DashboardStatCard
                title="Candidates"
                count={stats.totalCandidates}
                caption="Job seekers registered"
                icon="🎓"
                variant="shortlisted"
              />
              <DashboardStatCard
                title="Recruiters"
                count={stats.totalRecruiters}
                caption="Employers & recruiters"
                icon="🏢"
                variant="pending"
              />
              <DashboardStatCard
                title="Total Jobs"
                count={stats.totalJobs}
                caption={`${stats.activeJobs} currently active`}
                icon="💼"
                variant="selected"
              />
              <DashboardStatCard
                title="Applications"
                count={stats.totalApplications}
                caption="Total submissions"
                icon="📑"
                variant="total"
              />
            </section>
          )}

          {/* TAB BAR */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              borderBottom: "1px solid var(--color-border, #334155)",
              margin: "2rem 0 1.5rem 0",
            }}
          >
            <button
              type="button"
              onClick={() => setSearchParams({ tab: "overview" })}
              style={{
                padding: "0.75rem 1.25rem",
                background: "none",
                border: "none",
                borderBottom:
                  activeTab === "overview"
                    ? "2px solid var(--color-primary, #6366f1)"
                    : "2px solid transparent",
                color:
                  activeTab === "overview"
                    ? "var(--color-primary, #6366f1)"
                    : "var(--color-text-muted, #94a3b8)",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Overview &amp; Analytics
            </button>

            <button
              type="button"
              onClick={() => setSearchParams({ tab: "users" })}
              style={{
                padding: "0.75rem 1.25rem",
                background: "none",
                border: "none",
                borderBottom:
                  activeTab === "users"
                    ? "2px solid var(--color-primary, #6366f1)"
                    : "2px solid transparent",
                color:
                  activeTab === "users"
                    ? "var(--color-primary, #6366f1)"
                    : "var(--color-text-muted, #94a3b8)",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              User Management ({users.length})
            </button>

            <button
              type="button"
              onClick={() => setSearchParams({ tab: "jobs" })}
              style={{
                padding: "0.75rem 1.25rem",
                background: "none",
                border: "none",
                borderBottom:
                  activeTab === "jobs"
                    ? "2px solid var(--color-primary, #6366f1)"
                    : "2px solid transparent",
                color:
                  activeTab === "jobs"
                    ? "var(--color-primary, #6366f1)"
                    : "var(--color-text-muted, #94a3b8)",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Job Moderation ({jobs.length})
            </button>
          </div>

          {/* TAB 1: OVERVIEW & ANALYTICS */}
          {activeTab === "overview" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
              {/* Application Distribution Breakdown */}
              <div
                style={{
                  backgroundColor: "var(--color-surface, #1e293b)",
                  borderRadius: "14px",
                  padding: "1.5rem",
                  border: "1px solid var(--color-border, #334155)",
                }}
              >
                <h3 style={{ margin: "0 0 1rem 0", color: "var(--color-text, #f8fafc)" }}>
                  Application Pipeline Health
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                      <span>Shortlisted Candidates</span>
                      <strong>{stats.shortlistedApplications}</strong>
                    </div>
                    <div style={{ width: "100%", height: "8px", background: "var(--color-bg)", borderRadius: "4px" }}>
                      <div
                        style={{
                          width: `${stats.totalApplications ? (stats.shortlistedApplications / stats.totalApplications) * 100 : 0}%`,
                          height: "100%",
                          background: "#eab308",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                      <span>Interviews Scheduled</span>
                      <strong>{stats.interviewApplications}</strong>
                    </div>
                    <div style={{ width: "100%", height: "8px", background: "var(--color-bg)", borderRadius: "4px" }}>
                      <div
                        style={{
                          width: `${stats.totalApplications ? (stats.interviewApplications / stats.totalApplications) * 100 : 0}%`,
                          height: "100%",
                          background: "#6366f1",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                      <span>Selected &amp; Placed</span>
                      <strong>{stats.selectedApplications}</strong>
                    </div>
                    <div style={{ width: "100%", height: "8px", background: "var(--color-bg)", borderRadius: "4px" }}>
                      <div
                        style={{
                          width: `${stats.totalApplications ? (stats.selectedApplications / stats.totalApplications) * 100 : 0}%`,
                          height: "100%",
                          background: "#22c55e",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                      <span>Rejected Applications</span>
                      <strong>{stats.rejectedApplications}</strong>
                    </div>
                    <div style={{ width: "100%", height: "8px", background: "var(--color-bg)", borderRadius: "4px" }}>
                      <div
                        style={{
                          width: `${stats.totalApplications ? (stats.rejectedApplications / stats.totalApplications) * 100 : 0}%`,
                          height: "100%",
                          background: "#ef4444",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions Card */}
              <div
                style={{
                  backgroundColor: "var(--color-surface, #1e293b)",
                  borderRadius: "14px",
                  padding: "1.5rem",
                  border: "1px solid var(--color-border, #334155)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <h3 style={{ margin: "0 0 0.5rem 0", color: "var(--color-text, #f8fafc)" }}>
                    Admin Controls
                  </h3>
                  <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--color-text-muted, #94a3b8)" }}>
                    Inspect user registration logs, review recruiter postings, and enforce portal moderation guidelines.
                  </p>
                </div>

                <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
                  <button
                    type="button"
                    onClick={() => setSearchParams({ tab: "users" })}
                    className="app-primary-button"
                    style={{ flex: 1, textAlign: "center" }}
                  >
                    View All Users →
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchParams({ tab: "jobs" })}
                    style={{
                      flex: 1,
                      padding: "0.75rem 1rem",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border)",
                      background: "transparent",
                      color: "var(--color-text)",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Review Jobs →
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: USER MANAGEMENT */}
          {activeTab === "users" && (
            <section
              style={{
                backgroundColor: "var(--color-surface, #1e293b)",
                borderRadius: "14px",
                border: "1px solid var(--color-border, #334155)",
                padding: "1.5rem",
              }}
            >
              {/* User search & filter */}
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  flexWrap: "wrap",
                  marginBottom: "1.5rem",
                  justifyContent: "space-between",
                }}
              >
                <input
                  type="text"
                  placeholder="🔍 Search user by name or email..."
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setUserPage(1);
                  }}
                  style={{
                    flex: "1 1 300px",
                    padding: "0.6rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border, #334155)",
                    backgroundColor: "var(--color-bg, #0f172a)",
                    color: "var(--color-text, #f8fafc)",
                  }}
                />

                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {[
                    { label: "All Users", value: "All" },
                    { label: "Candidates", value: "user" },
                    { label: "Recruiters", value: "employer" },
                    { label: "Admins", value: "admin" },
                  ].map((r) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => {
                        setUserRoleFilter(r.value);
                        setUserPage(1);
                      }}
                      style={{
                        padding: "0.4rem 0.8rem",
                        borderRadius: "20px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        border:
                          userRoleFilter === r.value
                            ? "1px solid var(--color-primary, #6366f1)"
                            : "1px solid var(--color-border, #334155)",
                        backgroundColor:
                          userRoleFilter === r.value
                            ? "var(--color-primary, #6366f1)"
                            : "var(--color-bg, #0f172a)",
                        color:
                          userRoleFilter === r.value
                            ? "#ffffff"
                            : "var(--color-text-muted, #94a3b8)",
                        cursor: "pointer",
                      }}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <SkeletonLoader count={4} height="60px" />
              ) : users.length === 0 ? (
                <EmptyState
                  icon="👥"
                  title="No users found"
                  message="No user accounts match the current filter or search criteria."
                />
              ) : (
                <div className="dashboard-table-container">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>User Name</th>
                        <th>Email Address</th>
                        <th>Role</th>
                        <th>Account Status</th>
                        <th>Registered Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id}>
                          <td style={{ fontWeight: 600 }}>{u.name}</td>
                          <td>{u.email}</td>
                          <td>
                            <span
                              style={{
                                padding: "0.2rem 0.6rem",
                                borderRadius: "12px",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                textTransform: "capitalize",
                                backgroundColor:
                                  u.role === "admin"
                                    ? "rgba(168, 85, 247, 0.2)"
                                    : u.role === "employer"
                                    ? "rgba(59, 130, 246, 0.2)"
                                    : "rgba(16, 185, 129, 0.2)",
                                color:
                                  u.role === "admin"
                                    ? "#c084fc"
                                    : u.role === "employer"
                                    ? "#60a5fa"
                                    : "#34d399",
                              }}
                            >
                              {u.role === "employer" ? "Recruiter" : u.role}
                            </span>
                          </td>
                          <td>
                            <span
                              style={{
                                padding: "0.2rem 0.6rem",
                                borderRadius: "12px",
                                fontSize: "0.75rem",
                                fontWeight: 600,
                                backgroundColor:
                                  u.isActive !== false
                                    ? "rgba(34, 197, 94, 0.15)"
                                    : "rgba(239, 68, 68, 0.15)",
                                color: u.isActive !== false ? "#22c55e" : "#ef4444",
                              }}
                            >
                              {u.isActive !== false ? "Active" : "Disabled"}
                            </span>
                          </td>
                          <td style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => handleToggleUser(u._id, u.isActive !== false)}
                              style={{
                                padding: "0.35rem 0.75rem",
                                borderRadius: "6px",
                                border:
                                  u.isActive !== false
                                    ? "1px solid var(--color-danger, #ef4444)"
                                    : "1px solid var(--color-success, #22c55e)",
                                backgroundColor: "transparent",
                                color:
                                  u.isActive !== false
                                    ? "var(--color-danger, #ef4444)"
                                    : "var(--color-success, #22c55e)",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                              }}
                            >
                              {u.isActive !== false ? "Disable 🔒" : "Enable 🔓"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <Pagination
                    currentPage={userPagination.currentPage}
                    totalPages={userPagination.totalPages}
                    onPageChange={(page) => setUserPage(page)}
                  />
                </div>
              )}
            </section>
          )}

          {/* TAB 3: JOB MODERATION */}
          {activeTab === "jobs" && (
            <section
              style={{
                backgroundColor: "var(--color-surface, #1e293b)",
                borderRadius: "14px",
                border: "1px solid var(--color-border, #334155)",
                padding: "1.5rem",
              }}
            >
              {loading ? (
                <SkeletonLoader count={4} height="70px" />
              ) : jobs.length === 0 ? (
                <EmptyState
                  icon="💼"
                  title="No jobs found"
                  message="There are no job postings currently registered on the platform."
                />
              ) : (
                <div className="dashboard-table-container">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Company</th>
                        <th>Type &amp; Location</th>
                        <th>Posted By</th>
                        <th>Created</th>
                        <th>Moderation Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((job) => (
                        <tr key={job._id}>
                          <td>
                            <div style={{ fontWeight: 600, color: "var(--color-text, #f8fafc)" }}>
                              {job.title}
                            </div>
                          </td>
                          <td>{job.company}</td>
                          <td>
                            {job.type} · 📍 {job.location}
                          </td>
                          <td style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                            {job.postedBy?.name || "Recruiter"} ({job.postedBy?.email || "N/A"})
                          </td>
                          <td style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                            {new Date(job.createdAt).toLocaleDateString()}
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmJob(job)}
                              style={{
                                padding: "0.35rem 0.75rem",
                                borderRadius: "6px",
                                border: "1px solid var(--color-danger, #ef4444)",
                                background: "rgba(239, 68, 68, 0.1)",
                                color: "var(--color-danger, #ef4444)",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                              }}
                            >
                              Remove Job 🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <Pagination
                    currentPage={jobPagination.currentPage}
                    totalPages={jobPagination.totalPages}
                    onPageChange={(page) => setJobPage(page)}
                  />
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {/* CONFIRM DELETE MODAL */}
      <Modal
        isOpen={Boolean(deleteConfirmJob)}
        onClose={() => setDeleteConfirmJob(null)}
        title="Admin Job Moderation - Remove Job"
        maxWidth="460px"
      >
        <p style={{ margin: "0 0 1.5rem 0", color: "var(--color-text-muted)" }}>
          As an administrator, are you sure you want to remove the job{" "}
          <strong style={{ color: "var(--color-text)" }}>
            "{deleteConfirmJob?.title}"
          </strong>{" "}
          posted by {deleteConfirmJob?.company}?
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
          <button
            type="button"
            onClick={() => setDeleteConfirmJob(null)}
            style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "1px solid var(--color-border)", background: "transparent", color: "var(--color-text)", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDeleteJob}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "6px",
              border: "none",
              backgroundColor: "var(--color-danger, #ef4444)",
              color: "#fff",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Yes, Remove Job
          </button>
        </div>
      </Modal>
    </div>
  );
}
