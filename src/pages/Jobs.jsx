import { useState, useEffect, useCallback, useMemo } from "react";
import JobCard from "../components/JobCard";
import JobFilter from "../components/JobFilter";
import Pagination from "../components/Pagination";
import SkeletonLoader from "../components/SkeletonLoader";
import ErrorMessage from "../components/ErrorMessage";
import EmptyState from "../components/EmptyState";
import { getJobs } from "../services/api";
import useDebounce from "../hooks/useDebounce";

function Jobs() {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 400);

  const [selectedType, setSelectedType] = useState("All");
  const [locationFilter, setLocationFilter] = useState("");
  const debouncedLocation = useDebounce(locationFilter, 400);

  const [skillFilter, setSkillFilter] = useState("");
  const debouncedSkill = useDebounce(skillFilter, 400);

  const [companyFilter, setCompanyFilter] = useState("");
  const debouncedCompany = useDebounce(companyFilter, 400);

  const [minSalary, setMinSalary] = useState("");
  const debouncedMinSalary = useDebounce(minSalary, 400);

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

  // Fetch jobs whenever debounced query parameters change
  const fetchJobsList = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        search: debouncedSearch.trim() || undefined,
        type: selectedType !== "All" ? selectedType : undefined,
        location: debouncedLocation.trim() || undefined,
        skill: debouncedSkill.trim() || undefined,
        company: debouncedCompany.trim() || undefined,
        minSalary: debouncedMinSalary.trim() || undefined,
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
      setError(
        err.message || "Unable to load opportunities. Please check your connection and try again."
      );
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [
    debouncedSearch,
    selectedType,
    debouncedLocation,
    debouncedSkill,
    debouncedCompany,
    debouncedMinSalary,
    sortOption,
    currentPage,
    limit,
  ]);

  useEffect(() => {
    fetchJobsList();
  }, [fetchJobsList]);

  // Reset page to 1 whenever filters change
  const handleSearchChange = (val) => {
    setSearch(val);
    setCurrentPage(1);
  };

  const handleTypeChange = (type) => {
    setSelectedType(type);
    setCurrentPage(1);
  };

  const handleLocationChange = (val) => {
    setLocationFilter(val);
    setCurrentPage(1);
  };

  const handleSkillChange = (val) => {
    setSkillFilter(val);
    setCurrentPage(1);
  };

  const handleCompanyChange = (val) => {
    setCompanyFilter(val);
    setCurrentPage(1);
  };

  const handleMinSalaryChange = (val) => {
    setMinSalary(val);
    setCurrentPage(1);
  };

  const handleSortChange = (val) => {
    setSortOption(val);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedType("All");
    setLocationFilter("");
    setSkillFilter("");
    setCompanyFilter("");
    setMinSalary("");
    setSortOption("newest");
    setCurrentPage(1);
  };

  // Helper for job icons
  const getJobIcon = (title = "") => {
    const t = title.toLowerCase();
    if (t.includes("python")) return "🐍";
    if (t.includes("java")) return "☕";
    if (t.includes("design") || t.includes("ui") || t.includes("ux")) return "🎨";
    if (t.includes("ai") || t.includes("machine") || t.includes("learning")) return "🤖";
    if (t.includes("data") || t.includes("analyst")) return "📊";
    if (t.includes("cloud") || t.includes("devops")) return "☁️";
    if (t.includes("mobile") || t.includes("android") || t.includes("ios")) return "📱";
    if (t.includes("react") || t.includes("frontend")) return "⚛️";
    if (t.includes("node") || t.includes("backend")) return "⚙️";
    return "💼";
  };

  return (
    <div className="jobs-page">
      {/* JOB HERO */}
      <section className="jobs-hero">
        <p className="page-label">CAREER OPPORTUNITIES</p>
        <h1>Explore Jobs &amp; Internships</h1>
        <p>
          Find vetted opportunities matching your skill set, interests, and career trajectory.
        </p>
      </section>

      {/* JOB SECTION */}
      <section className="jobs-section">
        {/* ADVANCED FILTER COMPONENT */}
        <JobFilter
          search={search}
          onSearchChange={handleSearchChange}
          selectedType={selectedType}
          onTypeChange={handleTypeChange}
          locationFilter={locationFilter}
          onLocationChange={handleLocationChange}
          skillFilter={skillFilter}
          onSkillChange={handleSkillChange}
          companyFilter={companyFilter}
          onCompanyChange={handleCompanyChange}
          minSalary={minSalary}
          onMinSalaryChange={handleMinSalaryChange}
          sortOption={sortOption}
          onSortChange={handleSortChange}
          onResetFilters={handleResetFilters}
        />

        {/* JOB COUNT & STATUS */}
        <div
          className="job-count"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            Showing <strong>{jobs.length}</strong> of{" "}
            <strong>{pagination.totalCount || jobs.length}</strong> opportunities
            {pagination.totalPages > 1 && (
              <span> (Page {pagination.currentPage} of {pagination.totalPages})</span>
            )}
          </div>
        </div>

        {/* LOADING STATE WITH SKELETON */}
        {loading && <SkeletonLoader count={6} height="200px" />}

        {/* ERROR STATE */}
        {!loading && error && (
          <ErrorMessage
            title="Unable to Load Opportunities"
            message={error}
            onRetry={fetchJobsList}
          />
        )}

        {/* EMPTY STATE */}
        {!loading && !error && jobs.length === 0 && (
          <EmptyState
            icon="🔍"
            title="No Matching Opportunities Found"
            message="No jobs match your search criteria. Try removing some filters or searching with different keywords."
            actionLabel="Reset All Filters"
            onAction={handleResetFilters}
          />
        )}

        {/* JOB CARDS */}
        {!loading && !error && jobs.length > 0 && (
          <>
            <div className="jobs-grid">
              {jobs.map((job) => (
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
                  icon={getJobIcon(job.title)}
                  showMatch={true}
                />
              ))}
            </div>

            {/* PAGINATION COMPONENT */}
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              onPageChange={(page) => setCurrentPage(page)}
              hasNextPage={pagination.hasNextPage}
              hasPrevPage={pagination.hasPrevPage}
            />
          </>
        )}
      </section>
    </div>
  );
}

export default Jobs;