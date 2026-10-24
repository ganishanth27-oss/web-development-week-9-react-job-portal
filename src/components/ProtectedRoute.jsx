import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "./LoadingSpinner";

/**
 * Role-aware protected route component.
 * Allows restricting pages to specific roles: 'candidate' (or 'user'), 'recruiter' (or 'employer'), 'admin'.
 * Redirects unauthenticated users to /login and unauthorized roles to their dashboard.
 */
export default function ProtectedRoute({ allowedRoles = [] }) {
  const { isAuthenticated, loading, role, user } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <section
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "50vh",
        }}
        aria-live="polite"
      >
        <LoadingSpinner />
      </section>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          job: location.state?.job,
        }}
      />
    );
  }

  // Check role-based access if allowedRoles are specified
  if (allowedRoles.length > 0) {
    const rawRole = user?.role || "user";
    const mappedRole = role; // "candidate" | "recruiter" | "admin"

    const isAllowed = allowedRoles.some(
      (r) =>
        r === rawRole ||
        r === mappedRole ||
        (r === "candidate" && rawRole === "user") ||
        (r === "recruiter" && rawRole === "employer") ||
        (r === "employer" && mappedRole === "recruiter") ||
        (r === "user" && mappedRole === "candidate")
    );

    if (!isAllowed) {
      // Redirect to the appropriate dashboard for the user's role
      const defaultDashboard =
        mappedRole === "admin"
          ? "/admin"
          : mappedRole === "recruiter"
          ? "/recruiter"
          : "/dashboard";

      return <Navigate to={defaultDashboard} replace />;
    }
  }

  return <Outlet />;
}
