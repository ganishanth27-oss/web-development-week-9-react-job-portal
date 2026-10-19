export default function DashboardStatCard({
  title,
  count = 0,
  caption,
  icon,
  variant = "default",
  className = "",
}) {
  return (
    <article
      className={`dashboard-stat-card stat-${variant} ${className}`.trim()}
      aria-label={`${title}: ${count}`}
    >
      <div className="stat-card-header">
        <span className="stat-icon" aria-hidden="true">
          {icon}
        </span>
        <span className="stat-variant-tag">{title}</span>
      </div>
      <div className="stat-card-body">
        <strong className="stat-count">{count}</strong>
        {caption && <span className="stat-caption">{caption}</span>}
      </div>
    </article>
  );
}
