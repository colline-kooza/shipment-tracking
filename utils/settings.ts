// utils/settings.ts
// Client-side utility functions for settings validation

/**
 * Validate password strength
 * This is a utility function, not a server action
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }

  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate email format
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate name (at least 2 characters, no special characters except spaces, hyphens, apostrophes)
 */
export function validateName(name: string): {
  isValid: boolean;
  error?: string;
} {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { isValid: false, error: "Name is required" };
  }

  if (trimmedName.length < 2) {
    return { isValid: false, error: "Name must be at least 2 characters long" };
  }

  if (trimmedName.length > 100) {
    return { isValid: false, error: "Name must be less than 100 characters" };
  }

  // Allow letters, spaces, hyphens, and apostrophes
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(trimmedName)) {
    return {
      isValid: false,
      error: "Name can only contain letters, spaces, hyphens, and apostrophes",
    };
  }

  return { isValid: true };
}

/**
 * Check if passwords match
 */
export function validatePasswordMatch(
  password: string,
  confirmPassword: string
): boolean {
  return password === confirmPassword && password.length > 0;
}
