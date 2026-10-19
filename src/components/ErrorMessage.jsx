export default function ErrorMessage({
  message = "An error occurred.",
  onRetry,
  retryLabel = "Retry",
  title = "Unable to load data",
  className = "",
}) {
  return (
    <div
      className={`app-error-state ${className}`.trim()}
      role="alert"
      aria-live="assertive"
    >
      <div className="error-icon" aria-hidden="true">
        ⚠️
      </div>
      <div className="error-content">
        {title && <h3 className="error-title">{title}</h3>}
        <p className="error-text">{message}</p>
      </div>
      {onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="app-retry-button"
        >
          <span aria-hidden="true">↻</span> {retryLabel}
        </button>
      )}
    </div>
  );
}
