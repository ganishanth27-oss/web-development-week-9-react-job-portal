import React from "react";

export default function JobFilter({
  search,
  onSearchChange,
  selectedType,
  onTypeChange,
  locationFilter,
  onLocationChange,
  skillFilter,
  onSkillChange,
  companyFilter,
  onCompanyChange,
  minSalary,
  onMinSalaryChange,
  sortOption,
  onSortChange,
  onResetFilters,
}) {
  const jobTypes = [
    "All",
    "Internship",
    "Full-time",
    "Part-time",
    "Remote",
    "Contract",
  ];

  const sortOptions = [
    { label: "Newest First", value: "newest" },
    { label: "Oldest First", value: "oldest" },
    { label: "Salary: Low to High", value: "salary-low" },
    { label: "Salary: High to Low", value: "salary-high" },
    { label: "Deadline Soonest", value: "deadline" },
  ];

  return (
    <div
      className="job-filter-container"
      style={{
        backgroundColor: "var(--color-surface, #1e293b)",
        padding: "1.5rem",
        borderRadius: "14px",
        border: "1px solid var(--color-border, #334155)",
        marginBottom: "2rem",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Top Search Input */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="🔍 Search by job title, company, or keywords..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="filter-search-input"
          style={{
            width: "100%",
            padding: "0.85rem 1.25rem",
            borderRadius: "10px",
            border: "1px solid var(--color-border, #334155)",
            backgroundColor: "var(--color-bg, #0f172a)",
            color: "var(--color-text, #f8fafc)",
            fontSize: "1rem",
            outline: "none",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Advanced Filter Inputs Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "1rem",
          marginBottom: "1.25rem",
        }}
      >
        <div>
          <label
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--color-text-muted, #94a3b8)",
              display: "block",
              marginBottom: "0.35rem",
            }}
          >
            Location
          </label>
          <input
            type="text"
            placeholder="e.g. Bangalore, Remote"
            value={locationFilter}
            onChange={(e) => onLocationChange(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem 0.85rem",
              borderRadius: "8px",
              border: "1px solid var(--color-border, #334155)",
              backgroundColor: "var(--color-bg, #0f172a)",
              color: "var(--color-text, #f8fafc)",
              fontSize: "0.9rem",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div>
          <label
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--color-text-muted, #94a3b8)",
              display: "block",
              marginBottom: "0.35rem",
            }}
          >
            Skills
          </label>
          <input
            type="text"
            placeholder="e.g. React, Node.js, Python"
            value={skillFilter}
            onChange={(e) => onSkillChange(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem 0.85rem",
              borderRadius: "8px",
              border: "1px solid var(--color-border, #334155)",
              backgroundColor: "var(--color-bg, #0f172a)",
              color: "var(--color-text, #f8fafc)",
              fontSize: "0.9rem",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div>
          <label
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--color-text-muted, #94a3b8)",
              display: "block",
              marginBottom: "0.35rem",
            }}
          >
            Company
          </label>
          <input
            type="text"
            placeholder="e.g. Google, TechNova"
            value={companyFilter}
            onChange={(e) => onCompanyChange(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem 0.85rem",
              borderRadius: "8px",
              border: "1px solid var(--color-border, #334155)",
              backgroundColor: "var(--color-bg, #0f172a)",
              color: "var(--color-text, #f8fafc)",
              fontSize: "0.9rem",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div>
          <label
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--color-text-muted, #94a3b8)",
              display: "block",
              marginBottom: "0.35rem",
            }}
          >
            Min Salary (₹)
          </label>
          <input
            type="number"
            placeholder="e.g. 15000"
            value={minSalary}
            onChange={(e) => onMinSalaryChange(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem 0.85rem",
              borderRadius: "8px",
              border: "1px solid var(--color-border, #334155)",
              backgroundColor: "var(--color-bg, #0f172a)",
              color: "var(--color-text, #f8fafc)",
              fontSize: "0.9rem",
              boxSizing: "border-box",
            }}
          />
        </div>

        <div>
          <label
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              color: "var(--color-text-muted, #94a3b8)",
              display: "block",
              marginBottom: "0.35rem",
            }}
          >
            Sort By
          </label>
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value)}
            style={{
              width: "100%",
              padding: "0.6rem 0.85rem",
              borderRadius: "8px",
              border: "1px solid var(--color-border, #334155)",
              backgroundColor: "var(--color-bg, #0f172a)",
              color: "var(--color-text, #f8fafc)",
              fontSize: "0.9rem",
              boxSizing: "border-box",
              cursor: "pointer",
            }}
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Job Type Pills and Clear Button */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {jobTypes.map((type) => {
            const active = selectedType === type;
            return (
              <button
                key={type}
                type="button"
                onClick={() => onTypeChange(type)}
                style={{
                  padding: "0.45rem 0.9rem",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  fontWeight: active ? 700 : 500,
                  border: active
                    ? "1px solid var(--color-primary, #6366f1)"
                    : "1px solid var(--color-border, #334155)",
                  backgroundColor: active
                    ? "var(--color-primary, #6366f1)"
                    : "var(--color-bg, #0f172a)",
                  color: active ? "#ffffff" : "var(--color-text-muted, #94a3b8)",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                {type}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onResetFilters}
          style={{
            background: "transparent",
            border: "1px dashed var(--color-border, #475569)",
            color: "var(--color-text-muted, #94a3b8)",
            padding: "0.45rem 0.9rem",
            borderRadius: "8px",
            fontSize: "0.85rem",
            cursor: "pointer",
            fontWeight: 500,
            transition: "all 0.2s",
          }}
        >
          Reset All Filters ↺
        </button>
      </div>
    </div>
  );
}
