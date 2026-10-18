import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function JobCard({
  _id,
  id,
  icon = "💼",
  title,
  company,
  location,
  type = "Internship",
  category,
  skills = [],
  description,
  salary,
  deadline,
}) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const jobId = _id || id;

  const handleApply = () => {
    const jobPayload = {
      _id: jobId,
      id: jobId,
      icon: icon || "💼",
      title,
      company,
      location,
      type,
      category: category || "Engineering",
      skills,
      description,
    };

    if (!isAuthenticated) {
      alert("Please log in before applying for an internship.");
      navigate("/login", {
        state: {
          from: "/apply",
          job: jobPayload,
        },
      });
      return;
    }

    navigate("/apply", {
      state: {
        job: jobPayload,
      },
    });
  };

  const formattedDeadline = deadline
    ? new Date(deadline).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <div className="job-card">
      <div className="job-top">
        <div className="job-icon">{icon}</div>
        <span className="job-type">{type}</span>
      </div>

      <h3>
  <button
    type="button"
    className="job-title-link"
    onClick={() => navigate(`/jobs/${jobId}`)}
    disabled={!jobId}
  >
    {title}
  </button>
</h3>
      <p className="job-company">{company}</p>

      <div className="job-details">
        <span>📍 {location}</span>
        {category && <span>💼 {category}</span>}
        {salary?.max ? (
          <span>💰 ₹{salary.min ? `${salary.min.toLocaleString()} - ` : ""}{salary.max.toLocaleString()}</span>
        ) : null}
        {formattedDeadline && <span>⏳ Due: {formattedDeadline}</span>}
      </div>

      <p className="job-description">{description}</p>

      {Array.isArray(skills) && skills.length > 0 && (
        <div className="job-skills-tags">
          {skills.map((skill, idx) => (
            <span key={idx} className="job-skill-pill">
              {skill}
            </span>
          ))}
        </div>
      )}

      <button
        type="button"
        className="apply-button"
        onClick={handleApply}
      >
        Apply Now →
      </button>
    </div>
  );
}

export default JobCard;