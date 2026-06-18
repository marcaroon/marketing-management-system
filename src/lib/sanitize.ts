/**
 * Input sanitization utilities for XSS prevention.
 * Applied to user-supplied text before storing in Firestore.
 */

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
};

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"'/]/g, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Sanitize a string by trimming whitespace and escaping HTML.
 * Returns empty string for null/undefined.
 */
export function sanitizeString(value: string | null | undefined): string {
  if (!value) return "";
  return escapeHtml(value.trim());
}

/**
 * Sanitize an object's string fields recursively.
 * Preserves non-string values (numbers, booleans, dates, Timestamps, arrays).
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const result: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === "string") {
      result[key] = sanitizeString(value);
    } else if (
      value !== null &&
      value !== undefined &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      typeof value.toDate !== "function" && // Skip Timestamps
      !(value instanceof Date)
    ) {
      result[key] = sanitizeObject(value);
    } else {
      result[key] = value;
    }
  }
  return result as T;
}

/**
 * Validate and sanitize email address.
 */
export function sanitizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

/**
 * Validate and sanitize phone number — keep digits, +, -, (, ), and spaces only.
 */
export function sanitizePhone(phone: string): string {
  return phone.replace(/[^\d+\-() ]/g, "").trim();
}
