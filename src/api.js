// DG Interns Hub - Reusable API Client Module
// Uses VITE_API_URL environment variable or falls back to http://localhost:5000

const BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(/\/+$/, "");

/**
 * Token management helpers
 */
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
    // Ignore storage errors in restricted contexts
  }
}

export function removeToken() {
  try {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("authUser");
  } catch {
    // Ignore storage errors
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
    // Ignore storage errors
  }
}

/**
 * Core HTTP request handler
 * Handles network failures, invalid JSON responses, expired sessions, and backend validation errors.
 */
async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = getToken();

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (_netErr) {
    throw new Error(
      `Unable to connect to the server (${BASE_URL}). Please verify your backend is running.`
    );
  }

  let data;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    try {
      data = await response.json();
    } catch {
      data = { message: "Invalid JSON response from server" };
    }
  } else {
    const text = await response.text();
    data = { message: text || `Request failed with status ${response.status}` };
  }

  if (!response.ok) {
    // If session expired or unauthorized on private endpoint, clear stale token
    if (response.status === 401) {
      removeToken();
    }

    // Extract validation errors array if present (e.g., express-validator)
    let errorMessage = "Something went wrong";
    if (data?.errors && Array.isArray(data.errors) && data.errors.length > 0) {
      errorMessage = data.errors.map((e) => e.msg || e.message).join(", ");
    } else if (data?.message) {
      errorMessage = data.message;
    } else if (data?.error) {
      errorMessage = typeof data.error === "string" ? data.error : JSON.stringify(data.error);
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

// =========================================================
// 1. AUTHENTICATION APIS
// =========================================================

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function registerUser(name, email, password) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

/**
 * Login user
 * POST /api/auth/login
 */
export async function loginUser(email, password) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Get current authenticated user
 * GET /api/auth/me
 */
export async function getMe() {
  return request("/api/auth/me", {
    method: "GET",
  });
}

/**
 * Logout
 * POST /api/auth/logout
 */
export async function logoutUser() {
  try {
    await request("/api/auth/logout", {
      method: "POST",
    });
  } finally {
    removeToken();
  }
}

// =========================================================
// 2. USER PROFILE APIS
// =========================================================

/**
 * Get user profile
 * GET /api/users/profile
 */
export async function getUserProfile() {
  return request("/api/users/profile", {
    method: "GET",
  });
}

/**
 * Update user profile
 * PUT /api/users/profile
 */
export async function updateUserProfile(profileData) {
  return request("/api/users/profile", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
}

/**
 * Delete user profile
 * DELETE /api/users/profile
 */
export async function deleteUserProfile(password) {
  return request("/api/users/profile", {
    method: "DELETE",
    body: JSON.stringify({ password }),
  });
}

// =========================================================
// 3. JOBS / INTERNSHIPS APIS
// =========================================================

/**
 * Fetch jobs with search, filters, pagination and sorting
 * GET /api/jobs
 * Supported params: { search, type, location, skill, page, limit, sort }
 */
export async function getJobs(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "" && value !== "All") {
      query.set(key, value);
    }
  });

  const queryString = query.toString();
  const endpoint = `/api/jobs${queryString ? `?${queryString}` : ""}`;

  return request(endpoint, {
    method: "GET",
  });
}

/**
 * Get a single job by ID
 * GET /api/jobs/:id
 */
export async function getJobById(id) {
  return request(`/api/jobs/${id}`, {
    method: "GET",
  });
}

// =========================================================
// 4. APPLICATIONS APIS
// =========================================================

/**
 * Submit internship application
 * POST /api/applications
 */
export async function submitApplication(applicationData) {
  return request("/api/applications", {
    method: "POST",
    body: JSON.stringify(applicationData),
  });
}

/**
 * Get logged-in user's applications
 * GET /api/applications/my
 */
export async function getMyApplications(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, value);
    }
  });

  const queryString = query.toString();
  const endpoint = `/api/applications/my${queryString ? `?${queryString}` : ""}`;

  return request(endpoint, {
    method: "GET",
  });
}
