export default function StatusBadge({ status = "Pending", className = "" }) {
  const normalized = String(status || "").trim().toLowerCase();

  let badgeType = "pending";
  let label = status || "Pending";

  if (normalized === "pending" || normalized === "applied") {
    badgeType = "pending";
    label = "Pending";
  } else if (
    normalized === "shortlisted" ||
    normalized === "reviewed" ||
    normalized === "under review"
  ) {
    badgeType = "shortlisted";
    label = normalized === "shortlisted" ? "Shortlisted" : "Reviewed";
  } else if (normalized === "selected" || normalized === "accepted") {
    badgeType = "selected";
    label = normalized === "selected" ? "Selected" : "Accepted";
  } else if (normalized === "rejected") {
    badgeType = "rejected";
    label = "Rejected";
  }

  return (
    <span
      className={`status-badge status-${badgeType} ${className}`.trim()}
      data-status={badgeType}
    >
      <span className="status-dot" aria-hidden="true" />
      {label}
    </span>
  );
}
