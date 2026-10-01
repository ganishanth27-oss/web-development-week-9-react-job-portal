function JobCard({
  icon,
  title,
  company,
  location,
  type,
  category,
  description
}) {
  return (
    <div className="job-card">

      <div className="job-top">
        <div className="job-icon">
          {icon}
        </div>

        <span className="job-type">
          {type}
        </span>
      </div>

      <h3>{title}</h3>

      <p className="job-company">
        {company}
      </p>

      <div className="job-details">

        <span>
          📍 {location}
        </span>

        <span>
          💼 {category}
        </span>

      </div>

      <p className="job-description">
        {description}
      </p>

      <button
        className="apply-button"
        onClick={() =>
          alert(`Application started for ${title}`)
        }
      >
        Apply Now →
      </button>

    </div>
  );
}

export default JobCard;