import { useState, useEffect, useCallback } from "react";
import JobCard from "../components/JobCard";
import { getJobs } from "../api";

function Jobs() {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState("All");
  const [locationFilter, setLocationFilter] = useState("");
  const [skillFilter, setSkillFilter] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(6);

  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const jobTypes = ["All", "Internship", "Full-time", "Part-time", "Remote", "Contract"];
  const sortOptions = [
    { label: "Newest First", value: "newest" },
    { label: "Oldest First", value: "oldest" },
    { label: "Deadline Soonest", value: "deadline" },
  ];

  // Fetch jobs whenever query parameters change
  const fetchJobsList = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        search: search.trim() || undefined,
        type: selectedType !== "All" ? selectedType : undefined,
        location: locationFilter.trim() || undefined,
        skill: skillFilter.trim() || undefined,
        sort: sortOption,
        page: currentPage,
        limit,
      };

      const res = await getJobs(params);

      if (res?.success) {
        setJobs(res.jobs || []);
        if (res.pagination) {
          setPagination(res.pagination);
        }
      } else {
        setJobs([]);
      }
    } catch (err) {
      setError(err.message || "Failed to load jobs from server.");
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [search, selectedType, locationFilter, skillFilter, sortOption, currentPage, limit]);

  useEffect(() => {
    fetchJobsList();
  }, [fetchJobsList]);

  // Reset page to 1 when filters or search change
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const handleLocationChange = (e) => {
    setLocationFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSkillChange = (e) => {
    setSkillFilter(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedType("All");
    setLocationFilter("");
    setSkillFilter("");
    setSortOption("newest");
    setCurrentPage(1);
  };

  return (
    <div className="jobs-page">
      {/* JOB HERO */}
      <section className="jobs-hero">
        <p className="page-label">CAREER OPPORTUNITIES</p>
        <h1>Explore Jobs &amp; Internships</h1>
        <p>
          Find opportunities that match your skills,
          interests and career goals.
        </p>
      </section>

      {/* JOB SECTION */}
      <section className="jobs-section">
        {/* SEARCH AND CONTROLS */}
        <div className="jobs-controls">
          <div className="search-box">
            <span>🔍</span>
            <input
              type="text"
              placeholder="Search title, company, skills, or location..."
              value={search}
              onChange={handleSearchChange}
              aria-label="Search internships"
            />
          </div>

          <div className="category-buttons">
            {jobTypes.map((type) => (
              <button
                key={type}
                type="button"
                className={selectedType === type ? "category-btn active" : "category-btn"}
                onClick={() => handleTypeChange(type)}
              >
                {type}
              </button>
            ))}
          </div>

          {/* COMBINED FILTERS ROW: Location, Skill, Sort */}
          <div className="advanced-filters-row">
            <div className="filter-input-group">
              <span className="filter-icon">📍</span>
              <input
                type="text"
                placeholder="Filter by location (e.g. Remote, Bangalore)"
                value={locationFilter}
                onChange={handleLocationChange}
                aria-label="Filter by location"
              />
            </div>

            <div className="filter-input-group">
              <span className="filter-icon">⚡</span>
              <input
                type="text"
                placeholder="Filter by skill (e.g. React, Node, Python)"
                value={skillFilter}
                onChange={handleSkillChange}
                aria-label="Filter by skill"
              />
            </div>

            <div className="filter-select-group">
              <label htmlFor="job-sort-select">Sort by:</label>
              <select
                id="job-sort-select"
                value={sortOption}
                onChange={handleSortChange}
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {(search || selectedType !== "All" || locationFilter || skillFilter) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="reset-filters-btn"
                title="Reset all filters"
              >
                Clear Filters ✕
              </button>
            )}
          </div>
        </div>

        {/* JOB COUNT & STATUS */}
        <div className="job-count">
          Showing <strong>{jobs.length}</strong> of{" "}
          <strong>{pagination.totalCount || jobs.length}</strong> opportunities
          {pagination.totalPages > 1 && (
            <span> (Page {pagination.currentPage} of {pagination.totalPages})</span>
          )}
        </div>

        {/* LOADING STATE */}
        {loading && (
          <div className="jobs-loading-state">
            <div className="spinner"></div>
            <p>Loading opportunities from server...</p>
          </div>
        )}

        {/* ERROR STATE */}
        {!loading && error && (
          <div className="jobs-error-state">
            <p className="error-title">⚠️ Error loading opportunities</p>
            <p className="error-message">{error}</p>
            <button
              type="button"
              className="retry-button"
              onClick={fetchJobsList}
            >
              Try Again ↻
            </button>
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && !error && jobs.length === 0 && (
          <div className="no-jobs">
            <div>🔍</div>
            <h3>No opportunities found</h3>
            <p>Try adjusting your search query, location, or type filters.</p>
            <button
              type="button"
              className="clear-filter-action-btn"
              onClick={handleResetFilters}
            >
              Reset Filters
            </button>
          </div>
        )}

        {/* JOB CARDS */}
        {!loading && !error && jobs.length > 0 && (
          <>
            <div className="jobs-grid">
              {jobs.map((job) => (
                <JobCard
                  key={job._id || job.id || job.title}
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
                  icon={
                    job.title.toLowerCase().includes("python")
                      ? "🐍"
                      : job.title.toLowerCase().includes("java ") || job.title.toLowerCase().startsWith("java")
                      ? "☕"
                      : job.title.toLowerCase().includes("design") || job.title.toLowerCase().includes("ui")
                      ? "🎨"
                      : job.title.toLowerCase().includes("learning") || job.title.toLowerCase().includes("machine")
                      ? "🤖"
                      : job.title.toLowerCase().includes("data") || job.title.toLowerCase().includes("analyst")
                      ? "📊"
                      : job.title.toLowerCase().includes("devops") || job.title.toLowerCase().includes("cloud")
                      ? "☁️"
                      : job.title.toLowerCase().includes("mobile") || job.title.toLowerCase().includes("android") || job.title.toLowerCase().includes("ios")
                      ? "📱"
                      : job.title.toLowerCase().includes("backend")
                      ? "⚙️"
                      : "💻"
                  }
                />
              ))}
            </div>

            {/* PAGINATION CONTROLS */}
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
                  onClick={() => setCurrentPage((prev) => Math.min(pagination.totalPages, prev + 1))}
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}

export default Jobs;