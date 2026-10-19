
/**
 * DG Interns Hub - Reusable API Client
 * Supports JSON requests and multipart PDF resume uploads.
 */

const BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/+$/, "");

// =========================================================
// TOKEN AND USER STORAGE
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
    // Ignore storage errors in restricted contexts.
  }
}

export function removeToken() {
  try {
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("authUser");
  } catch {
    // Ignore storage errors.
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
    // Ignore storage errors.
  }
}

// =========================================================
// CORE HTTP REQUEST HANDLER
// Supports JSON and FormData.
// =========================================================

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const token = getToken();

  const isFormData =
    typeof FormData !== "undefined" &&
    options.body instanceof FormData;

  // Do not manually set Content-Type for FormData.
  // The browser must generate the multipart boundary.
  const headers = {
    ...(isFormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response;

  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch {
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
      data = {
        message: "Invalid JSON response from server.",
      };
    }
  } else {
    const responseText = await response.text();

    data = {
      message:
        responseText || `Request failed with status ${response.status}.`,
    };
  }

  if (!response.ok) {
    if (response.status === 401) {
      removeToken();
    }

    let errorMessage = "Something went wrong.";

    if (Array.isArray(data?.errors) && data.errors.length > 0) {
      errorMessage = data.errors
        .map((error) => error.msg || error.message)
        .filter(Boolean)
        .join(", ");
    } else if (data?.message) {
      errorMessage = data.message;
    } else if (data?.error) {
      errorMessage =
        typeof data.error === "string"
          ? data.error
          : JSON.stringify(data.error);
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
 * Register a new user.
 * POST /api/auth/register
 */
export async function registerUser(name, email, password) {
  return request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
}

/**
 * Log in a user.
 * POST /api/auth/login
 */
export async function loginUser(email, password) {
  return request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

/**
 * Get the current authenticated user.
 * GET /api/auth/me
 */
export async function getMe() {
  return request("/api/auth/me", {
    method: "GET",
  });
}

/**
 * Log out the current user.
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
 * Get the current user's profile.
 * GET /api/users/profile
 */
export async function getUserProfile() {
  return request("/api/users/profile", {
    method: "GET",
  });
}

/**
 * Update the user's profile.
 * PUT /api/users/profile
 */
export async function updateUserProfile(profileData) {
  return request("/api/users/profile", {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
}

/**
 * Delete the user's profile.
 * DELETE /api/users/profile
 */
export async function deleteUserProfile(password) {
  return request("/api/users/profile", {
    method: "DELETE",
    body: JSON.stringify({ password }),
  });
}

// =========================================================
// 3. JOBS AND INTERNSHIPS APIS
// =========================================================

/**
 * Fetch jobs with optional search, filters, pagination and sorting.
 * GET /api/jobs
 */
export async function getJobs(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== "" &&
      value !== "All"
    ) {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  const endpoint = `/api/jobs${
    queryString ? `?${queryString}` : ""
  }`;

  return request(endpoint, {
    method: "GET",
  });
}

/**
 * Fetch a single job by ID.
 * GET /api/jobs/:id
 */
export async function getJobById(id) {
  return request(`/api/jobs/${encodeURIComponent(id)}`, {
    method: "GET",
  });
}

// =========================================================
// 4. APPLICATION APIS
// =========================================================

/**
 * Submit an application.
 * POST /api/applications
 *
 * Pass FormData for PDF resume uploads.
 * Plain JavaScript objects continue to be sent as JSON.
 *
 * FormData field names:
 * jobTitle, company, location, category, fullName,
 * email, phone, coverLetter, job (optional), resume.
 */
export async function submitApplication(applicationData) {
  const isFormData =
    typeof FormData !== "undefined" &&
    applicationData instanceof FormData;

  return request("/api/applications", {
    method: "POST",
    body: isFormData
      ? applicationData
      : JSON.stringify(applicationData),
  });
}

/**
 * Get the logged-in user's applications.
 * GET /api/applications/my
 */
export async function getMyApplications(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (
      value !== undefined &&
      value !== null &&
      value !== ""
    ) {
      query.set(key, String(value));
    }
  });

  const queryString = query.toString();
  const endpoint = `/api/applications/my${
    queryString ? `?${queryString}` : ""
  }`;

  return request(endpoint, {
    method: "GET",
  });
}
