import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  getRecruiterApplications,
  getJobs,
  createJob,
  updateJob,
  deleteJob,
  updateApplicationStatus,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";

import Sidebar from "../components/Sidebar";
import DashboardStatCard from "../components/DashboardStatCard";
import StatusBadge from "../components/StatusBadge";
import SkeletonLoader from "../components/SkeletonLoader";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import Modal from "../components/Modal";
import Pagination from "../components/Pagination";

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const { addToast, addNotification } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get("tab") || "overview";

  // Data states
  const [stats, setStats] = useState({
    activeJobs: 0,
    totalApplications: 0,
    shortlisted: 0,
    interviews: 0,
  });
  const [jobs, setJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Applicant filter & pagination
  const [applicantStatus, setApplicantStatus] = useState("All");
  const [applicantSearch, setApplicantSearch] = useState("");
  const [applicantPage, setApplicantPage] = useState(1);
  const [applicantPagination, setApplicantPagination] = useState({
    totalPages: 1,
    currentPage: 1,
  });

  // Modal states for Create/Edit Job
  const [jobModalOpen, setJobModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [jobFormData, setJobFormData] = useState({
    title: "",
    company: "",
    description: "",
    location: "",
    type: "Internship",
    skills: "",
    minSalary: "",
    maxSalary: "",
    deadline: "",
  });
  const [jobSubmitting, setJobSubmitting] = useState(false);

  // Modal state for viewing applicant details
  const [selectedApplicant, setSelectedApplicant] = useState(null);

  // Modal state for job deletion confirmation
  const [deleteConfirmJob, setDeleteConfirmJob] = useState(null);

  const fetchRecruiterData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [appRes, jobRes] = await Promise.all([
        getRecruiterApplications({
          status: applicantStatus !== "All" ? applicantStatus : undefined,
          search: applicantSearch.trim() || undefined,
          page: applicantPage,
          limit: 10,
        }),
        getJobs({ limit: 50 }),
      ]);

      if (appRes?.success) {
        setApplicants(appRes.applications || []);
        if (appRes.stats) {
          setStats(appRes.stats);
        }
        if (appRes.pagination) {
          setApplicantPagination(appRes.pagination);
        }
      }

      if (jobRes?.success) {
        // Filter jobs posted by this user (or show all if admin)
        const myJobs =
          user?.role === "admin"
            ? jobRes.jobs
            : jobRes.jobs.filter(
                (j) =>
                  j.postedBy?._id === user?.id ||
                  j.postedBy === user?.id ||
                  j.postedBy?.email === user?.email
              );
        setJobs(myJobs);
      }
    } catch (err) {
      setError(err.message || "Failed to load recruiter data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [applicantStatus, applicantSearch, applicantPage, user]);

  useEffect(() => {
    fetchRecruiterData();
  }, [fetchRecruiterData]);

  // Open Create Job Modal
  const handleOpenCreateModal = () => {
    setEditingJob(null);
    setJobFormData({
      title: "",
      company: user?.name ? `${user.name} Tech` : "Tech Corp",
      description: "",
      location: "Bangalore",
      type: "Internship",
      skills: "",
      minSalary: "20000",
      maxSalary: "35000",
      deadline: "",
    });
    setJobModalOpen(true);
  };

  // Open Edit Job Modal
  const handleOpenEditModal = (job) => {
    setEditingJob(job);
    setJobFormData({
      title: job.title || "",
      company: job.company || "",
      description: job.description || "",
      location: job.location || "",
      type: job.type || "Internship",
      skills: Array.isArray(job.skills) ? job.skills.join(", ") : "",
      minSalary: job.salary?.min || "",
      maxSalary: job.salary?.max || "",
      deadline: job.deadline ? job.deadline.split("T")[0] : "",
    });
    setJobModalOpen(true);
  };

  // Submit Job (Create or Edit)
  const handleJobSubmit = async (e) => {
    e.preventDefault();
    if (!jobFormData.title.trim() || !jobFormData.company.trim() || !jobFormData.description.trim()) {
      addToast({ message: "Please fill in all required job fields.", type: "warning" });
      return;
    }

    setJobSubmitting(true);
    try {
      const payload = {
        title: jobFormData.title.trim(),
        company: jobFormData.company.trim(),
        description: jobFormData.description.trim(),
        location: jobFormData.location.trim(),
        type: jobFormData.type,
        skills: jobFormData.skills
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        salary: {
          min: Number(jobFormData.minSalary) || 0,
          max: Number(jobFormData.maxSalary) || 0,
          currency: "INR",
        },
        deadline: jobFormData.deadline || undefined,
      };

      if (editingJob) {
        await updateJob(editingJob._id, payload);
        addToast({ message: "Job opportunity updated successfully!", type: "success" });
        addNotification({
          title: "Job Updated",
          message: `"${payload.title}" was updated successfully.`,
          type: "success",
        });
      } else {
        await createJob(payload);
        addToast({ message: "Job opportunity created successfully!", type: "success" });
        addNotification({
          title: "Job Created",
          message: `"${payload.title}" is now published and active.`,
          type: "success",
        });
      }

      setJobModalOpen(false);
      fetchRecruiterData();
    } catch (err) {
      addToast({ message: err.message || "Failed to save job.", type: "danger" });
    } finally {
      setJobSubmitting(false);
    }
  };

  // Delete Job
  const handleDeleteJob = async () => {
    if (!deleteConfirmJob) return;
    try {
      await deleteJob(deleteConfirmJob._id);
      addToast({ message: "Job deleted successfully.", type: "success" });
      setDeleteConfirmJob(null);
      fetchRecruiterData();
    } catch (err) {
      addToast({ message: err.message || "Failed to delete job.", type: "danger" });
    }
  };

  // Update Status of Application
  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateApplicationStatus(appId, newStatus);
      addToast({ message: `Status updated to ${newStatus}.`, type: "success" });
      addNotification({
        title: "Application Status Changed",
        message: `Candidate application set to ${newStatus}.`,
        type: "info",
      });
      // Update local state
      setApplicants((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
      );
      if (selectedApplicant && selectedApplicant._id === appId) {
        setSelectedApplicant((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      addToast({ message: err.message || "Failed to update status.", type: "danger" });
    }
  };

  return (
    <div style={{ display: "flex", minHeight: "calc(100vh - 70px)" }}>
      {/* SIDEBAR NAVIGATION */}
      <Sidebar />

      {/* RECRUITER CONTENT AREA */}
      <main style={{ flex: 1, padding: "2rem", overflowX: "hidden" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* WELCOME / ACTIONS HEADER */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "1rem",
              marginBottom: "2rem",
            }}
          >
            <div>
              <p className="dashboard-eyebrow">RECRUITER PORTAL</p>
              <h1 style={{ margin: "0.25rem 0", color: "var(--color-text, #f8fafc)" }}>
                Hiring &amp; Applicant Management
              </h1>
              <p style={{ margin: 0, color: "var(--color-text-muted, #94a3b8)" }}>
                Review candidate pipelines, manage your active job postings, and update application stages.
              </p>
            </div>

            <button
              type="button"
              className="app-primary-button"
              onClick={handleOpenCreateModal}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.75rem 1.25rem",
              }}
            >
              <span>➕</span> Post New Job
            </button>
          </div>

          {/* REAL STATS OVERVIEW */}
          {loading ? (
            <SkeletonLoader count={4} height="120px" style={{ gridTemplateColumns: "repeat(4, 1fr)" }} />
          ) : (
            <section className="dashboard-stats">
              <DashboardStatCard
                title="Active Jobs"
                count={stats.activeJobs}
                caption="Job opportunities posted"
                icon="💼"
                variant="total"
              />
              <DashboardStatCard
                title="Total Applications"
                count={stats.totalApplications}
                caption="Received candidate submissions"
                icon="📑"
                variant="pending"
              />
              <DashboardStatCard
                title="Shortlisted"
                count={stats.shortlisted}
                caption="Candidates in review"
                icon="⭐"
                variant="shortlisted"
              />
              <DashboardStatCard
                title="Interviews"
                count={stats.interviews}
                caption="Candidates for interview"
                icon="🎙️"
                variant="selected"
              />
            </section>
          )}

          {error && <ErrorMessage message={error} onRetry={fetchRecruiterData} />}

          {/* TAB NAVIGATION */}
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
              onClick={() => setSearchParams({ tab: "applicants" })}
              style={{
                padding: "0.75rem 1.25rem",
                background: "none",
                border: "none",
                borderBottom:
                  activeTab === "applicants" || activeTab === "overview"
                    ? "2px solid var(--color-primary, #6366f1)"
                    : "2px solid transparent",
                color:
                  activeTab === "applicants" || activeTab === "overview"
                    ? "var(--color-primary, #6366f1)"
                    : "var(--color-text-muted, #94a3b8)",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              Candidate Applicants ({applicants.length})
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
              My Job Postings ({jobs.length})
            </button>
          </div>

          {/* TAB 1: APPLICANTS PIPELINE */}
          {(activeTab === "applicants" || activeTab === "overview") && (
            <section
              style={{
                backgroundColor: "var(--color-surface, #1e293b)",
                borderRadius: "14px",
                border: "1px solid var(--color-border, #334155)",
                padding: "1.5rem",
              }}
            >
              {/* Applicant Filters */}
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
                  placeholder="🔍 Search candidate by name, email, or role..."
                  value={applicantSearch}
                  onChange={(e) => setApplicantSearch(e.target.value)}
                  style={{
                    flex: "1 1 300px",
                    padding: "0.6rem 1rem",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border, #334155)",
                    backgroundColor: "var(--color-bg, #0f172a)",
                    color: "var(--color-text, #f8fafc)",
                  }}
                />

                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  {[
                    "All",
                    "Applied",
                    "Under Review",
                    "Shortlisted",
                    "Interview",
                    "Selected",
                    "Rejected",
                  ].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setApplicantStatus(status)}
                      style={{
                        padding: "0.4rem 0.8rem",
                        borderRadius: "20px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        border:
                          applicantStatus === status
                            ? "1px solid var(--color-primary, #6366f1)"
                            : "1px solid var(--color-border, #334155)",
                        backgroundColor:
                          applicantStatus === status
                            ? "var(--color-primary, #6366f1)"
                            : "var(--color-bg, #0f172a)",
                        color:
                          applicantStatus === status
                            ? "#ffffff"
                            : "var(--color-text-muted, #94a3b8)",
                        cursor: "pointer",
                      }}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <SkeletonLoader count={4} height="70px" />
              ) : applicants.length === 0 ? (
                <EmptyState
                  icon="📑"
                  title="No applicants found"
                  message="No candidates match your current filter settings or job postings."
                />
              ) : (
                <div className="dashboard-table-container">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Candidate</th>
                        <th>Job Applied</th>
                        <th>Current Status</th>
                        <th>Resume</th>
                        <th>Update Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applicants.map((app) => (
                        <tr key={app._id}>
                          <td>
                            <div style={{ fontWeight: 600, color: "var(--color-text, #f8fafc)" }}>
                              {app.fullName}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted, #94a3b8)" }}>
                              {app.email} · {app.phone}
                            </div>
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, color: "var(--color-text, #f8fafc)" }}>
                              {app.jobTitle}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted, #94a3b8)" }}>
                              {app.company}
                            </div>
                          </td>
                          <td>
                            <StatusBadge status={app.status} />
                          </td>
                          <td>
                            {app.resumeUrl ? (
                              <a
                                href={app.resumeUrl}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  color: "var(--color-primary, #818cf8)",
                                  textDecoration: "underline",
                                  fontSize: "0.85rem",
                                }}
                              >
                                View Resume 📄
                              </a>
                            ) : (
                              <span style={{ color: "var(--color-text-muted)" }}>None</span>
                            )}
                          </td>
                          <td>
                            <select
                              value={app.status}
                              onChange={(e) => handleStatusChange(app._id, e.target.value)}
                              style={{
                                padding: "0.35rem 0.6rem",
                                borderRadius: "6px",
                                border: "1px solid var(--color-border, #334155)",
                                backgroundColor: "var(--color-bg, #0f172a)",
                                color: "var(--color-text, #f8fafc)",
                                fontSize: "0.8rem",
                                cursor: "pointer",
                              }}
                            >
                              <option value="Applied">Applied</option>
                              <option value="Under Review">Under Review</option>
                              <option value="Shortlisted">Shortlisted</option>
                              <option value="Interview">Interview</option>
                              <option value="Selected">Selected</option>
                              <option value="Rejected">Rejected</option>
                            </select>
                          </td>
                          <td>
                            <button
                              type="button"
                              onClick={() => setSelectedApplicant(app)}
                              className="dashboard-view-button"
                            >
                              Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <Pagination
                    currentPage={applicantPagination.currentPage}
                    totalPages={applicantPagination.totalPages}
                    onPageChange={(page) => setApplicantPage(page)}
                  />
                </div>
              )}
            </section>
          )}

          {/* TAB 2: MY JOBS POSTINGS */}
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
                <SkeletonLoader count={3} height="80px" />
              ) : jobs.length === 0 ? (
                <EmptyState
                  icon="💼"
                  title="No jobs posted yet"
                  message="Start hiring top talent by posting your first job or internship opportunity!"
                  actionText="Post New Job →"
                  onAction={handleOpenCreateModal}
                />
              ) : (
                <div className="dashboard-table-container">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Job Title</th>
                        <th>Type &amp; Location</th>
                        <th>Skills</th>
                        <th>Salary</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobs.map((job) => (
                        <tr key={job._id}>
                          <td>
                            <div style={{ fontWeight: 600, color: "var(--color-text, #f8fafc)" }}>
                              {job.title}
                            </div>
                            <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted, #94a3b8)" }}>
                              {job.company}
                            </div>
                          </td>
                          <td>
                            <div>{job.type}</div>
                            <div style={{ fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                              📍 {job.location}
                            </div>
                          </td>
                          <td style={{ maxWidth: "200px" }}>
                            {Array.isArray(job.skills) && job.skills.length > 0 ? (
                              <div style={{ display: "flex", gap: "0.3rem", flexWrap: "wrap" }}>
                                {job.skills.slice(0, 3).map((s, idx) => (
                                  <span key={idx} className="job-skill-pill" style={{ fontSize: "0.7rem" }}>
                                    {s}
                                  </span>
                                ))}
                                {job.skills.length > 3 && (
                                  <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}>
                                    +{job.skills.length - 3}
                                  </span>
                                )}
                              </div>
                            ) : (
                              "None"
                            )}
                          </td>
                          <td>
                            ₹{job.salary?.min ? job.salary.min.toLocaleString() : "0"} - ₹
                            {job.salary?.max ? job.salary.max.toLocaleString() : "0"}
                          </td>
                          <td>
                            <span
                              style={{
                                padding: "0.25rem 0.6rem",
                                borderRadius: "12px",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                backgroundColor: job.isActive !== false ? "rgba(34, 197, 94, 0.15)" : "rgba(239, 68, 68, 0.15)",
                                color: job.isActive !== false ? "#22c55e" : "#ef4444",
                              }}
                            >
                              {job.isActive !== false ? "Active" : "Closed"}
                            </span>
                          </td>
                          <td>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(job)}
                                style={{
                                  padding: "0.35rem 0.7rem",
                                  borderRadius: "6px",
                                  border: "1px solid var(--color-border, #334155)",
                                  background: "var(--color-bg, #0f172a)",
                                  color: "var(--color-text, #f8fafc)",
                                  cursor: "pointer",
                                  fontSize: "0.8rem",
                                }}
                              >
                                Edit ✏️
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmJob(job)}
                                style={{
                                  padding: "0.35rem 0.7rem",
                                  borderRadius: "6px",
                                  border: "1px solid var(--color-danger, #ef4444)",
                                  background: "rgba(239, 68, 68, 0.1)",
                                  color: "var(--color-danger, #ef4444)",
                                  cursor: "pointer",
                                  fontSize: "0.8rem",
                                }}
                              >
                                Delete 🗑️
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      {/* CREATE / EDIT JOB MODAL */}
      <Modal
        isOpen={jobModalOpen}
        onClose={() => setJobModalOpen(false)}
        title={editingJob ? "Edit Job Opportunity" : "Create New Job Opportunity"}
        maxWidth="600px"
      >
        <form onSubmit={handleJobSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>
              Job Title *
            </label>
            <input
              type="text"
              required
              value={jobFormData.title}
              onChange={(e) => setJobFormData({ ...jobFormData, title: e.target.value })}
              placeholder="e.g. Senior Frontend Engineer Intern"
              style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid var(--color-border)", background: "var(--color-bg)", color: "var(--color-text)" }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>
                Company Name *
              </label>
              <input
                type="text"
                required
                value={jobFormData.company}
                onChange={(e) => setJobFormData({ ...jobFormData, company: e.target.value })}
                placeholder="e.g. Google, TechCorp"
                style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid var(--color-border)", background: "var(--color-bg)", color: "var(--color-text)" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>
                Location *
              </label>
              <input
                type="text"
                required
                value={jobFormData.location}
                onChange={(e) => setJobFormData({ ...jobFormData, location: e.target.value })}
                placeholder="e.g. Remote, Bangalore"
                style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid var(--color-border)", background: "var(--color-bg)", color: "var(--color-text)" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>
                Job Type *
              </label>
              <select
                value={jobFormData.type}
                onChange={(e) => setJobFormData({ ...jobFormData, type: e.target.value })}
                style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid var(--color-border)", background: "var(--color-bg)", color: "var(--color-text)" }}
              >
                <option value="Internship">Internship</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>
                Application Deadline
              </label>
              <input
                type="date"
                value={jobFormData.deadline}
                onChange={(e) => setJobFormData({ ...jobFormData, deadline: e.target.value })}
                style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid var(--color-border)", background: "var(--color-bg)", color: "var(--color-text)" }}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>
                Min Salary (₹/month)
              </label>
              <input
                type="number"
                value={jobFormData.minSalary}
                onChange={(e) => setJobFormData({ ...jobFormData, minSalary: e.target.value })}
                placeholder="20000"
                style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid var(--color-border)", background: "var(--color-bg)", color: "var(--color-text)" }}
              />
            </div>
            <div>
              <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>
                Max Salary (₹/month)
              </label>
              <input
                type="number"
                value={jobFormData.maxSalary}
                onChange={(e) => setJobFormData({ ...jobFormData, maxSalary: e.target.value })}
                placeholder="35000"
                style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid var(--color-border)", background: "var(--color-bg)", color: "var(--color-text)" }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>
              Required Skills (comma separated)
            </label>
            <input
              type="text"
              value={jobFormData.skills}
              onChange={(e) => setJobFormData({ ...jobFormData, skills: e.target.value })}
              placeholder="React, Node.js, MongoDB, JavaScript"
              style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid var(--color-border)", background: "var(--color-bg)", color: "var(--color-text)" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.85rem", fontWeight: 600, display: "block", marginBottom: "0.3rem" }}>
              Job Description *
            </label>
            <textarea
              required
              rows={4}
              value={jobFormData.description}
              onChange={(e) => setJobFormData({ ...jobFormData, description: e.target.value })}
              placeholder="Describe candidate responsibilities, expectations, and requirements..."
              style={{ width: "100%", padding: "0.6rem 0.8rem", borderRadius: "8px", border: "1px solid var(--color-border)", background: "var(--color-bg)", color: "var(--color-text)", resize: "vertical" }}
            />
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "1rem" }}>
            <button
              type="button"
              onClick={() => setJobModalOpen(false)}
              style={{ padding: "0.6rem 1.2rem", borderRadius: "8px", border: "1px solid var(--color-border)", background: "transparent", color: "var(--color-text)", cursor: "pointer" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={jobSubmitting}
              className="app-primary-button"
            >
              {jobSubmitting ? "Saving..." : editingJob ? "Update Job" : "Create Job"}
            </button>
          </div>
        </form>
      </Modal>

      {/* APPLICANT DETAILS MODAL */}
      <Modal
        isOpen={Boolean(selectedApplicant)}
        onClose={() => setSelectedApplicant(null)}
        title="Candidate Application Details"
        maxWidth="600px"
      >
        {selectedApplicant && (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ background: "var(--color-bg, #0f172a)", padding: "1rem", borderRadius: "8px" }}>
              <h4 style={{ margin: "0 0 0.25rem 0", color: "var(--color-text, #f8fafc)" }}>
                {selectedApplicant.fullName}
              </h4>
              <p style={{ margin: 0, color: "var(--color-text-muted, #94a3b8)", fontSize: "0.85rem" }}>
                Email: {selectedApplicant.email} | Phone: {selectedApplicant.phone}
              </p>
            </div>

            <div>
              <strong>Applied For:</strong> {selectedApplicant.jobTitle} ({selectedApplicant.company})
            </div>

            <div>
              <strong>Current Status:</strong> <StatusBadge status={selectedApplicant.status} />
            </div>

            {selectedApplicant.coverLetter && (
              <div>
                <strong>Cover Letter / Statement:</strong>
                <p style={{ background: "var(--color-bg)", padding: "0.75rem", borderRadius: "6px", fontSize: "0.85rem", marginTop: "0.25rem" }}>
                  {selectedApplicant.coverLetter}
                </p>
              </div>
            )}

            {selectedApplicant.resumeUrl && (
              <div>
                <strong>Resume Document:</strong>
                <div style={{ marginTop: "0.35rem" }}>
                  <a
                    href={selectedApplicant.resumeUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      padding: "0.5rem 1rem",
                      borderRadius: "6px",
                      backgroundColor: "var(--color-primary, #6366f1)",
                      color: "#fff",
                      textDecoration: "none",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    Open Resume PDF 📄
                  </a>
                </div>
              </div>
            )}

            <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "1rem" }}>
              <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: 600, fontSize: "0.85rem" }}>
                Change Application Status:
              </label>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {["Under Review", "Shortlisted", "Interview", "Selected", "Rejected"].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => handleStatusChange(selectedApplicant._id, st)}
                    style={{
                      padding: "0.4rem 0.8rem",
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      border:
                        selectedApplicant.status === st
                          ? "1px solid var(--color-primary)"
                          : "1px solid var(--color-border)",
                      backgroundColor:
                        selectedApplicant.status === st
                          ? "var(--color-primary)"
                          : "transparent",
                      color: selectedApplicant.status === st ? "#fff" : "var(--color-text)",
                    }}
                  >
                    Set to {st}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE JOB CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(deleteConfirmJob)}
        onClose={() => setDeleteConfirmJob(null)}
        title="Confirm Job Deletion"
        maxWidth="450px"
      >
        <p style={{ margin: "0 0 1.5rem 0", color: "var(--color-text-muted)" }}>
          Are you sure you want to permanently delete the job opportunity{" "}
          <strong style={{ color: "var(--color-text)" }}>
            "{deleteConfirmJob?.title}"
          </strong>
          ? This action cannot be undone.
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
            Yes, Delete Job
          </button>
        </div>
      </Modal>
    </div>
  );
}
