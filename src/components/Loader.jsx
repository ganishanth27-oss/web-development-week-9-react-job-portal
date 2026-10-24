import React from "react";
import LoadingSpinner from "./LoadingSpinner";

export default function Loader({ text = "Loading content...", fullScreen = false }) {
  const containerStyle = fullScreen
    ? {
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--color-bg, #0f172a)",
        zIndex: 9999,
        gap: "1rem",
      }
    : {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "3rem 1rem",
        gap: "1rem",
      };

  return (
    <div style={containerStyle} aria-live="polite" role="status">
      <LoadingSpinner />
      {text && (
        <p style={{ color: "var(--color-text-muted, #94a3b8)", fontSize: "0.95rem" }}>
          {text}
        </p>
      )}
    </div>
  );
}
