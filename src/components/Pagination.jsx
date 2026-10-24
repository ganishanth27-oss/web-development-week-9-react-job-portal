import React from "react";

export default function Pagination({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  hasNextPage,
  hasPrevPage,
}) {
  if (totalPages <= 1) return null;

  const canGoPrev = hasPrevPage !== undefined ? hasPrevPage : currentPage > 1;
  const canGoNext =
    hasNextPage !== undefined ? hasNextPage : currentPage < totalPages;

  // Generate page numbers window (max 5 visible)
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav
      className="pagination-container"
      aria-label="Pagination Navigation"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.5rem",
        marginTop: "2rem",
        flexWrap: "wrap",
      }}
    >
      <button
        type="button"
        className="pagination-btn"
        disabled={!canGoPrev}
        onClick={() => onPageChange(currentPage - 1)}
        style={{
          padding: "0.5rem 0.85rem",
          borderRadius: "8px",
          border: "1px solid var(--color-border, #334155)",
          background: "var(--color-surface, #1e293b)",
          color: canGoPrev
            ? "var(--color-text, #f8fafc)"
            : "var(--color-text-muted, #64748b)",
          cursor: canGoPrev ? "pointer" : "not-allowed",
          fontWeight: 600,
          fontSize: "0.875rem",
          transition: "all 0.2s ease",
        }}
      >
        ← Previous
      </button>

      {pages[0] > 1 && (
        <>
          <button
            type="button"
            className="pagination-btn"
            onClick={() => onPageChange(1)}
            style={{
              padding: "0.5rem 0.85rem",
              borderRadius: "8px",
              border: "1px solid var(--color-border, #334155)",
              background: "var(--color-surface, #1e293b)",
              color: "var(--color-text, #f8fafc)",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            1
          </button>
          {pages[0] > 2 && <span style={{ color: "var(--color-text-muted)" }}>...</span>}
        </>
      )}

      {pages.map((p) => {
        const isActive = p === currentPage;
        return (
          <button
            key={p}
            type="button"
            className={`pagination-btn ${isActive ? "active" : ""}`}
            onClick={() => onPageChange(p)}
            style={{
              padding: "0.5rem 0.85rem",
              borderRadius: "8px",
              border: isActive
                ? "1px solid var(--color-primary, #6366f1)"
                : "1px solid var(--color-border, #334155)",
              background: isActive
                ? "var(--color-primary, #6366f1)"
                : "var(--color-surface, #1e293b)",
              color: "#ffffff",
              cursor: "pointer",
              fontWeight: isActive ? 700 : 500,
              fontSize: "0.875rem",
              transition: "all 0.2s ease",
            }}
          >
            {p}
          </button>
        );
      })}

      {pages[pages.length - 1] < totalPages && (
        <>
          {pages[pages.length - 1] < totalPages - 1 && (
            <span style={{ color: "var(--color-text-muted)" }}>...</span>
          )}
          <button
            type="button"
            className="pagination-btn"
            onClick={() => onPageChange(totalPages)}
            style={{
              padding: "0.5rem 0.85rem",
              borderRadius: "8px",
              border: "1px solid var(--color-border, #334155)",
              background: "var(--color-surface, #1e293b)",
              color: "var(--color-text, #f8fafc)",
              cursor: "pointer",
              fontSize: "0.875rem",
            }}
          >
            {totalPages}
          </button>
        </>
      )}

      <button
        type="button"
        className="pagination-btn"
        disabled={!canGoNext}
        onClick={() => onPageChange(currentPage + 1)}
        style={{
          padding: "0.5rem 0.85rem",
          borderRadius: "8px",
          border: "1px solid var(--color-border, #334155)",
          background: "var(--color-surface, #1e293b)",
          color: canGoNext
            ? "var(--color-text, #f8fafc)"
            : "var(--color-text-muted, #64748b)",
          cursor: canGoNext ? "pointer" : "not-allowed",
          fontWeight: 600,
          fontSize: "0.875rem",
          transition: "all 0.2s ease",
        }}
      >
        Next →
      </button>
    </nav>
  );
}
