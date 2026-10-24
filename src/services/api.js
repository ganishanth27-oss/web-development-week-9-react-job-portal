/**
 * DG Interns Hub - Centralized Axios API Service
 * Handles base URL, auth token attachment, JSON & multipart requests,
 * request/response interceptors, 401 unauthorized cleanup, and network error parsing.
 */

import axios from "axios";

export const BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

// =========================================================
// TOKEN AND SESSION STORAGE
// =========================================================

export function getToken() {
  try {
    return sessionStorage.getItem("authToken");
  } catch {
    return null;
  }
}

export function setToken(token) {
  try {
    if (token) {
      sessionStorage.setItem("authToken", token);
    } else {
      sessionStorage.removeItem("authToken");
    }
  } catch {
    // Ignore storage restrictions
  }
}

export function removeToken() {
  try {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("authUser");
  } catch {
    // Ignore storage restrictions
  }
}

export function getStoredUser() {
  try {
    const raw = sessionStorage.getItem("authUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user) {
  try {
    if (user) {
      sessionStorage.setItem("authUser", JSON.stringify(user));
    } else {
      sessionStorage.removeItem("authUser");
    }
  } catch {
    // Ignore storage restrictions
  }
}

// =========================================================
// AXIOS INSTANCE & INTERCEPTORS
// =========================================================

const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Request interceptor: Automatically attach token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Standardize errors and handle session expiry
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (!error.response) {
      const networkError = new Error(
        `Unable to connect to the server (${BASE_URL}). Please verify your backend is running.`
      );
      networkError.status = 0;
      return Promise.reject(networkError);
    }

    const { status, data } = error.response;

    if (status === 401) {
      removeToken();
      // Dispatch custom event so app can react if needed
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:unauthorized"));
      }
    }

    let errorMessage = "An unexpected error occurred.";
    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      errorMessage = data.errors
        .map((err) => err.msg || err.message)
        .filter(Boolean)
        .join(", ");
    } else if (data?.message) {
      errorMessage = data.message;
    } else if (typeof data?.error === "string") {
      errorMessage = data.error;
    }

    const standardizedError = new Error(errorMessage);
    standardizedError.status = status;
    standardizedError.data = data;
    return Promise.reject(standardizedError);
  }
);

// =========================================================
// 1. AUTHENTICATION APIS
// =========================================================

export async function registerUser(name, email, password, role = "user") {
  return apiClient.post("/api/auth/register", { name, email, password, role });
}

export async function loginUser(email, password) {
  return apiClient.post("/api/auth/login", { email, password });
}

export async function getMe() {
  return apiClient.get("/api/auth/me");
}

export async function logoutUser() {
  try {
    await apiClient.post("/api/auth/logout");
  } finally {
    removeToken();
  }
}

export async function getDashboardData() {
  return apiClient.get("/api/auth/dashboard");
}

// =========================================================
// 2. USER PROFILE APIS
// =========================================================

export async function getUserProfile() {
  return apiClient.get("/api/users/profile");
}

export async function updateUserProfile(profileData) {
  return apiClient.put("/api/users/profile", profileData);
}

export async function changePassword(currentPassword, newPassword) {
  return apiClient.put("/api/users/change-password", {
    currentPassword,
    newPassword,
  });
}

export async function deleteUserProfile(password) {
  return apiClient.delete("/api/users/profile", { data: { password } });
}

// =========================================================
// 3. JOBS AND INTERNSHIPS APIS
// =========================================================

export async function getJobs(params = {}) {
  const query = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "All") {
      query[key] = value;
    }
  });
  return apiClient.get("/api/jobs", { params: query });
}

export async function getJobById(id) {
  return apiClient.get(`/api/jobs/${encodeURIComponent(id)}`);
}

export async function createJob(jobData) {
  return apiClient.post("/api/jobs", jobData);
}

export async function updateJob(id, jobData) {
  return apiClient.put(`/api/jobs/${encodeURIComponent(id)}`, jobData);
}

export async function deleteJob(id) {
  return apiClient.delete(`/api/jobs/${encodeURIComponent(id)}`);
}

// =========================================================
// 4. APPLICATION APIS
// =========================================================

export async function submitApplication(applicationData) {
  const isFormData =
    typeof FormData !== "undefined" && applicationData instanceof FormData;

  return apiClient.post("/api/applications", applicationData, {
    headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
  });
}

export async function getMyApplications(params = {}) {
  const query = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query[key] = value;
    }
  });
  return apiClient.get("/api/applications/my", { params: query });
}

export async function getApplicationById(id) {
  return apiClient.get(`/api/applications/${encodeURIComponent(id)}`);
}

export async function getRecruiterApplications(params = {}) {
  const query = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "All") {
      query[key] = value;
    }
  });
  return apiClient.get("/api/applications/recruiter", { params: query });
}

export async function updateApplicationStatus(id, status) {
  return apiClient.put(
    `/api/applications/${encodeURIComponent(id)}/status`,
    { status }
  );
}

export async function deleteApplication(id) {
  return apiClient.delete(`/api/applications/${encodeURIComponent(id)}`);
}

// =========================================================
// 5. ADMIN APIS
// =========================================================

export async function getAdminUsers(params = {}) {
  const query = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "All") {
      query[key] = value;
    }
  });
  return apiClient.get("/api/users", { params: query });
}

export async function getAdminStats() {
  return apiClient.get("/api/users/stats/overview");
}

export async function toggleUserStatus(id, isActive) {
  return apiClient.patch(
    `/api/users/${encodeURIComponent(id)}/status`,
    { isActive }
  );
}

export default apiClient;
