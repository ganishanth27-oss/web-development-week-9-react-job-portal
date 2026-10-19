export default function LoadingSpinner({
  message = "Loading...",
  className = "",
  fullHeight = false,
}) {
  return (
    <div
      className={`app-loading-state ${fullHeight ? "full-height" : ""} ${className}`.trim()}
      role="status"
      aria-live="polite"
    >
      <div className="app-spinner" aria-hidden="true" />
      <p className="loading-message">{message}</p>
    </div>
  );
}
