import React from "react";
import { useApp } from "../context/AppContext";

export default function NotificationPanel({ isOpen, onClose }) {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    clearNotifications,
  } = useApp();

  if (!isOpen) return null;

  return (
    <div
      className="notification-panel-backdrop"
      onClick={onClose}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999,
      }}
    >
      <div
        className="notification-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "fixed",
          top: "70px",
          right: "20px",
          width: "380px",
          maxWidth: "calc(100vw - 40px)",
          backgroundColor: "var(--color-surface, #1e293b)",
          border: "1px solid var(--color-border, #334155)",
          borderRadius: "14px",
          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.4)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "520px",
          animation: "panelSlideDown 0.2s ease-out",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "1rem 1.25rem",
            borderBottom: "1px solid var(--color-border, #334155)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ fontSize: "1.2rem" }}>🔔</span>
            <h4 style={{ margin: 0, fontSize: "1rem", color: "var(--color-text, #f8fafc)" }}>
              Notifications
            </h4>
          </div>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {notifications.length > 0 && (
              <>
                <button
                  type="button"
                  onClick={markAllAsRead}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-primary, #6366f1)",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    padding: "0.2rem 0.4rem",
                  }}
                >
                  Mark all read
                </button>
                <button
                  type="button"
                  onClick={clearNotifications}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--color-danger, #ef4444)",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    padding: "0.2rem 0.4rem",
                  }}
                >
                  Clear
                </button>
              </>
            )}
          </div>
        </div>

        <div
          style={{
            overflowY: "auto",
            padding: "0.5rem 0",
            flex: 1,
          }}
        >
          {notifications.length === 0 ? (
            <div
              style={{
                padding: "2.5rem 1rem",
                textAlign: "center",
                color: "var(--color-text-muted, #94a3b8)",
                fontSize: "0.9rem",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📭</div>
              No notifications yet
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => markAsRead(item.id)}
                style={{
                  padding: "0.75rem 1.25rem",
                  borderBottom: "1px solid var(--color-border, #334155)",
                  backgroundColor: item.read
                    ? "transparent"
                    : "rgba(99, 102, 241, 0.08)",
                  cursor: "pointer",
                  transition: "background 0.2s",
                  display: "flex",
                  gap: "0.75rem",
                  alignItems: "flex-start",
                }}
              >
                <span style={{ fontSize: "1.1rem" }}>
                  {item.type === "success"
                    ? "✅"
                    : item.type === "warning"
                    ? "⚠️"
                    : item.type === "danger"
                    ? "❌"
                    : "ℹ️"}
                </span>
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                    }}
                  >
                    <span
                      style={{
                        fontWeight: item.read ? 600 : 700,
                        fontSize: "0.875rem",
                        color: "var(--color-text, #f8fafc)",
                      }}
                    >
                      {item.title}
                    </span>
                    {!item.read && (
                      <span
                        style={{
                          width: "8px",
                          height: "8px",
                          borderRadius: "50%",
                          backgroundColor: "var(--color-primary, #6366f1)",
                        }}
                      />
                    )}
                  </div>
                  <p
                    style={{
                      margin: "0.25rem 0 0 0",
                      fontSize: "0.8rem",
                      color: "var(--color-text-muted, #94a3b8)",
                      lineHeight: 1.4,
                    }}
                  >
                    {item.message}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
