import React from "react";

export default function SkeletonLoader({
  count = 3,
  type = "card",
  height = "120px",
  style = {},
}) {
  const items = Array.from({ length: count }, (_, i) => i);

  if (type === "card") {
    return (
      <div className="skeleton-grid" style={{ display: "grid", gap: "1.25rem", ...style }}>
        {items.map((i) => (
          <div
            key={i}
            className="skeleton-card"
            style={{
              height,
              borderRadius: "12px",
              background:
                "linear-gradient(90deg, var(--color-surface, #1e293b) 25%, var(--color-surface-hover, #334155) 50%, var(--color-surface, #1e293b) 75%)",
              backgroundSize: "200% 100%",
              animation: "skeleton-shimmer 1.5s infinite linear",
              border: "1px solid var(--color-border, #334155)",
            }}
          />
        ))}
      </div>
    );
  }

  if (type === "text") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", ...style }}>
        {items.map((i) => (
          <div
            key={i}
            style={{
              height: height || "1rem",
              width: i === 0 ? "100%" : i === items.length - 1 ? "60%" : "85%",
              borderRadius: "6px",
              background:
                "linear-gradient(90deg, var(--color-surface, #1e293b) 25%, var(--color-surface-hover, #334155) 50%, var(--color-surface, #1e293b) 75%)",
              backgroundSize: "200% 100%",
              animation: "skeleton-shimmer 1.5s infinite linear",
            }}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      style={{
        height,
        borderRadius: "8px",
        background:
          "linear-gradient(90deg, var(--color-surface, #1e293b) 25%, var(--color-surface-hover, #334155) 50%, var(--color-surface, #1e293b) 75%)",
        backgroundSize: "200% 100%",
        animation: "skeleton-shimmer 1.5s infinite linear",
        ...style,
      }}
    />
  );
}
