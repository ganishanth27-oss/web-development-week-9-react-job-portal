import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getUserProfile, updateUserProfile, deleteUserProfile } from "../api";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, isAuthenticated, loading: authLoading, updateUser, logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Account deletion modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/login", { state: { from: "/profile" } });
      return;
    }

    async function fetchProfileData() {
      setLoading(true);
      setError("");
      try {
        const res = await getUserProfile();
        if (res?.user) {
          setProfile(res.user);
          setName(res.user.name || "");
        }
      } catch (err) {
        if (err.status === 401) {
          navigate("/login", { state: { from: "/profile" } });
          return;
        }
        setError(err.message || "Failed to load user profile.");
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      fetchProfileData();
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Handle profile name update (PUT /api/users/profile)
  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setUpdating(true);

    try {
      const res = await updateUserProfile({ name: name.trim() });
      if (res?.user) {
        setProfile(res.user);
        updateUser(res.user);
        setMessage(res.message || "Profile updated successfully!");
      }
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setUpdating(false);
    }
  };

  // Handle account deletion (DELETE /api/users/profile)
  const handleDeleteAccount = async (e) => {
    e.preventDefault();
    if (!deletePassword) {
      setDeleteError("Please enter your current password to confirm deletion.");
      return;
    }

    setDeleting(true);
    setDeleteError("");

    try {
      await deleteUserProfile(deletePassword);
      alert("Your account has been permanently deleted.");
      await logout();
      navigate("/");
    } catch (err) {
      setDeleteError(err.message || "Failed to delete account. Please verify your password.");
    } finally {
      setDeleting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <section className="profile-page">
        <div className="jobs-loading-state">
          <div className="spinner"></div>
          <p>Loading profile information...</p>
        </div>
      </section>
    );
  }

  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Member";

  return (
    <section className="profile-page">
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              {(profile?.name || user?.name || "U")[0].toUpperCase()}
            </div>
            <div>
              <p className="page-label">USER ACCOUNT</p>
              <h1>{profile?.name || "User Profile"}</h1>
              <p className="profile-sub">{profile?.email} · Joined {joinDate}</p>
            </div>
          </div>

          {message && <p className="auth-success">{message}</p>}
          {error && <p className="auth-error">{error}</p>}

          <form onSubmit={handleUpdate} className="profile-form">
            <div className="form-group">
              <label htmlFor="profile-name">Full Name</label>
              <input
                id="profile-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="profile-email">Email Address (Read-only)</label>
              <input
                id="profile-email"
                type="email"
                value={profile?.email || ""}
                disabled
                className="disabled-input"
              />
              <small>Email address is associated with your account identity and cannot be changed.</small>
            </div>

            <div className="form-group">
              <label htmlFor="profile-role">Account Role</label>
              <input
                id="profile-role"
                type="text"
                value={profile?.role || "user"}
                disabled
                className="disabled-input"
              />
            </div>

            <div className="profile-actions-row">
              <button
                type="submit"
                className="primary-button"
                disabled={updating}
              >
                {updating ? "Saving Changes..." : "Save Changes"}
              </button>

              <Link to="/my-applications" className="secondary-button">
                My Applications →
              </Link>
            </div>
          </form>

          {/* DANGER ZONE: ACCOUNT DELETION */}
          <div className="danger-zone-section">
            <h3>Danger Zone</h3>
            <p>
              Deleting your account is permanent. All your submitted applications and data will be removed.
            </p>
            <button
              type="button"
              className="delete-account-button"
              onClick={() => {
                setShowDeleteModal(true);
                setDeleteError("");
                setDeletePassword("");
              }}
            >
              Delete Account ✕
            </button>
          </div>
        </div>
      </div>

      {/* CONFIRMATION MODAL BEFORE ACCOUNT DELETION */}
      {showDeleteModal && (
        <div className="modal-backdrop">
          <div className="modal-card">
            <h3>Confirm Account Deletion</h3>
            <p className="modal-warning">
              Are you sure you want to delete your account? This action cannot be undone. All your applications will be permanently deleted.
            </p>

            <form onSubmit={handleDeleteAccount}>
              <div className="form-group">
                <label htmlFor="delete-confirm-password">Enter password to confirm:</label>
                <input
                  id="delete-confirm-password"
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
              </div>

              {deleteError && <p className="auth-error">{deleteError}</p>}

              <div className="modal-button-group">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="confirm-danger-button"
                  disabled={deleting}
                >
                  {deleting ? "Deleting..." : "Permanently Delete Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
