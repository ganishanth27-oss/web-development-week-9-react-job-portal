import React from "react";
import { useApp } from "../context/AppContext";

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      className="toast-container"
      style={{
        position: "fixed",
        bottom: "1.5rem",
        right: "1.5rem",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: "0.75rem",
        maxWidth: "380px",
        pointerEvents: "none",
      }}
      aria-live="polite"
    >
      {toasts.map((toast) => {
        let borderColor = "var(--color-primary, #6366f1)";
        let icon = "ℹ️";
        if (toast.type === "success") {
          borderColor = "#22c55e";
          icon = "✅";
        } else if (toast.type === "error") {
          borderColor = "#ef4444";
          icon = "❌";
        } else if (toast.type === "warning") {
          borderColor = "#f59e0b";
          icon = "⚠️";
        }

        return (
          <div
            key={toast.id}
            className="toast-item"
            style={{
              pointerEvents: "auto",
              background: "var(--color-surface, #1e293b)",
              color: "var(--color-text, #f8fafc)",
              border: `1px solid var(--color-border, #334155)`,
              borderLeft: `4px solid ${borderColor}`,
              borderRadius: "8px",
              padding: "0.85rem 1rem",
              boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.4)",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: "0.75rem",
              animation: "slideInRight 0.25s ease-out",
            }}
          >
            <div style={{ display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
              <span style={{ fontSize: "1.1rem", lineHeight: 1.2 }}>{icon}</span>
              <div>
                {toast.title && (
                  <div style={{ fontWeight: 600, fontSize: "0.9rem", marginBottom: "0.2rem" }}>
                    {toast.title}
                  </div>
                )}
                <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>
                  {toast.message}
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss toast"
              style={{
                background: "transparent",
                border: "none",
                color: "var(--color-text-muted, #94a3b8)",
                cursor: "pointer",
                fontSize: "1rem",
                padding: "0 0.25rem",
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>
        );
      })}
    </div>
  );
}
