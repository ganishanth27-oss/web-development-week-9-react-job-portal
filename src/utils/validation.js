/**
 * Centralized form and input validation helpers.
 */

export function isValidEmail(email) {
  if (!email || typeof email !== "string") return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

export function isValidPhone(phone) {
  if (!phone || typeof phone !== "string") return false;
  // Accepts 10 to 15 digits optionally prefixed with +
  const phoneRegex = /^[+]?[\d\s\-().]{10,18}$/;
  return phoneRegex.test(phone.trim());
}

export function validatePassword(password) {
  if (!password || password.length < 6) {
    return {
      isValid: false,
      message: "Password must be at least 6 characters long.",
    };
  }
  return { isValid: true, message: "" };
}

export function validateRegistration({ name, email, password, confirmPassword, phone }) {
  const errors = {};

  if (!name || !name.trim()) {
    errors.name = "Full name is required.";
  } else if (name.trim().length > 100) {
    errors.name = "Name cannot exceed 100 characters.";
  }

  if (!email || !email.trim()) {
    errors.email = "Email address is required.";
  } else if (!isValidEmail(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  } else if (password.length < 8) {
    errors.password = "Password must be at least 8 characters long.";
  }

  if (confirmPassword !== undefined && confirmPassword !== password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (phone && phone.trim() && !isValidPhone(phone)) {
    errors.phone = "Please enter a valid phone number.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateLogin({ email, password }) {
  const errors = {};

  if (!email || !email.trim()) {
    errors.email = "Email address is required.";
  } else if (!isValidEmail(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!password) {
    errors.password = "Password is required.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateJobApplication({
  fullName,
  email,
  phone,
  resume,
  resumeUrl,
}) {
  const errors = {};

  if (!fullName || !fullName.trim()) {
    errors.fullName = "Full name is required.";
  }

  if (!email || !email.trim()) {
    errors.email = "Email address is required.";
  } else if (!isValidEmail(email)) {
    errors.email = "Please enter a valid email address.";
  }

  if (!phone || !phone.trim()) {
    errors.phone = "Phone number is required.";
  } else if (!isValidPhone(phone)) {
    errors.phone = "Please enter a valid phone number.";
  }

  // Resume check
  if (!resume && !resumeUrl) {
    errors.resume = "A PDF resume file or valid resume URL is required.";
  } else if (resume) {
    const isPdf =
      resume.type === "application/pdf" ||
      resume.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      errors.resume = "Only PDF resumes are supported.";
    } else if (resume.size > 5 * 1024 * 1024) {
      errors.resume = "Resume file must not exceed 5MB.";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
