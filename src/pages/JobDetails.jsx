
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getJobById } from "../api";
import { useAuth } from "../context/AuthContext";

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadJob() {
      setLoading(true);
      setError("");

      try {
        const response = await getJobById(id);
        const jobData = response?.job ?? response?.data ?? response;

        if (!jobData || !(jobData._id || jobData.id)) {
          throw new Error("Job details could not be found.");
        }

        if (active) setJob(jobData);
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load this job.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadJob();

    return () => {
      active = false;
    };
  }, [id]);

  function handleApply() {
    if (!job) return;

    if (!isAuthenticated) {
      navigate("/login", {
        state: {
          from: "/apply",
          job,
        },
      });
      return;
    }

    navigate("/apply", { state: { job } });
  }

  if (loading) {
    return (
      <section className="page-container">
        <p role="status">Loading job details...</p>
      </section>
    );
  }

  if (error || !job) {
    return (
      <section className="page-container">
        <h1>Job details unavailable</h1>
        <p role="alert">{error || "This job could not be found."}</p>
        <Link to="/jobs">Back to Jobs</Link>
      </section>
    );
  }

  const skills = Array.isArray(job.skills) ? job.skills : [];
  const salary = job.salary;

  return (
    <section className="page-container job-details-page">
      <Link to="/jobs" className="back-link">
        ← Back to Jobs
      </Link>

      <article className="job-details-card">
        <p className="job-type">{job.type || "Internship"}</p>

        <h1>{job.title || "Untitled Opportunity"}</h1>
        <h2>{job.company || "Company not specified"}</h2>

        <div className="job-details">
          <span>📍 {job.location || "Location not specified"}</span>
          {job.category && <span>💼 {job.category}</span>}
          {job.deadline && (
            <span>
              Deadline:{" "}
              {new Date(job.deadline).toLocaleDateString()}
            </span>
          )}
          {salary?.max != null && (
            <span>
              Salary: ₹
              {salary.min != null
                ? `${Number(salary.min).toLocaleString()} - `
                : ""}
              {Number(salary.max).toLocaleString()}
            </span>
          )}
        </div>

        <h3>About this opportunity</h3>
        <p>{job.description || "No description provided."}</p>

        <h3>Required Skills</h3>
        {skills.length > 0 ? (
          <div className="job-skills-tags">
            {skills.map((skill, index) => (
              <span className="job-skill-pill" key={`${skill}-${index}`}>
                {skill}
              </span>
            ))}
          </div>
        ) : (
          <p>No specific skills listed.</p>
        )}

        <button
          type="button"
          className="apply-button"
          onClick={handleApply}
        >
          Apply Now →
        </button>
      </article>
    </section>
  );
}

export default JobDetails;
