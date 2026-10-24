import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Sidebar() {
  const { role, user } = useAuth();

  const getLinks = () => {
    if (role === "admin") {
      return [
        { to: "/admin", label: "Admin Overview", icon: "📊" },
        { to: "/admin?tab=users", label: "Manage Users", icon: "👥" },
        { to: "/admin?tab=jobs", label: "Manage Jobs", icon: "💼" },
        { to: "/jobs", label: "Browse Portal", icon: "🌐" },
      ];
    }
    if (role === "recruiter") {
      return [
        { to: "/recruiter", label: "Recruiter Dashboard", icon: "📊" },
        { to: "/recruiter?tab=jobs", label: "My Job Postings", icon: "💼" },
        { to: "/recruiter?tab=applicants", label: "Candidate Applicants", icon: "📑" },
        { to: "/jobs", label: "Browse Jobs", icon: "🔍" },
      ];
    }
    // Candidate
    return [
      { to: "/dashboard", label: "Dashboard", icon: "📊" },
      { to: "/jobs", label: "Search & Apply", icon: "💼" },
      { to: "/my-applications", label: "My Applications", icon: "📑" },
      { to: "/profile", label: "My Profile", icon: "👤" },
    ];
  };

  const links = getLinks();

  return (
    <aside
      className="dashboard-sidebar"
      style={{
        width: "250px",
        backgroundColor: "var(--color-surface, #1e293b)",
        borderRight: "1px solid var(--color-border, #334155)",
        padding: "1.5rem 1rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        minHeight: "calc(100vh - 70px)",
      }}
    >
      <div
        className="sidebar-user-brief"
        style={{
          padding: "1rem",
          background: "var(--color-bg, #0f172a)",
          borderRadius: "10px",
          border: "1px solid var(--color-border, #334155)",
        }}
      >
        <div style={{ fontWeight: 700, color: "var(--color-text, #f8fafc)" }}>
          {user?.name || "User"}
        </div>
        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--color-primary, #818cf8)",
            textTransform: "capitalize",
            marginTop: "0.2rem",
            fontWeight: 600,
          }}
        >
          {role} Account
        </div>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/dashboard" || link.to === "/recruiter" || link.to === "/admin"}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? "active" : ""}`
            }
            style={({ isActive }) => ({
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              padding: "0.75rem 1rem",
              borderRadius: "8px",
              color: isActive
                ? "#ffffff"
                : "var(--color-text-muted, #94a3b8)",
              backgroundColor: isActive
                ? "var(--color-primary, #6366f1)"
                : "transparent",
              textDecoration: "none",
              fontWeight: isActive ? 600 : 500,
              fontSize: "0.9rem",
              transition: "all 0.2s ease",
            })}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
