import { Link } from "react-router-dom";

export default function EmptyState({
  icon = "📂",
  title = "No items found",
  message = "There are no records to display at this time.",
  actionText,
  actionLink,
  onAction,
  className = "",
}) {
  return (
    <div className={`app-empty-state ${className}`.trim()}>
      <div className="empty-state-icon" aria-hidden="true">
        {icon}
      </div>
      <h3 className="empty-state-title">{title}</h3>
      <p className="empty-state-message">{message}</p>
      {actionText && actionLink && (
        <Link to={actionLink} className="app-primary-button">
          {actionText}
        </Link>
      )}
      {actionText && onAction && !actionLink && (
        <button
          type="button"
          onClick={onAction}
          className="app-primary-button"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
