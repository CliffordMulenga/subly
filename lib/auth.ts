export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

export function isValidEmail(value: string): boolean {
  const email = normalizeEmail(value);
  // Intentionally simple: avoid blocking valid but uncommon addresses.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(value: string): string | null {
  if (!value) return "Password is required.";
  if (value.length < 8) return "Use at least 8 characters.";
  return null;
}

export function extractClerkErrorMessage(error: unknown): string | null {
  if (!error) return null;
  if (typeof error === "string") return error;
  if (typeof error !== "object") return null;

  const maybeError = error as {
    message?: unknown;
    errors?: Array<{ message?: unknown; longMessage?: unknown }>;
  };

  const first = maybeError.errors?.[0];
  if (first) {
    if (typeof first.longMessage === "string") return first.longMessage;
    if (typeof first.message === "string") return first.message;
  }

  if (typeof maybeError.message === "string") return maybeError.message;
  return null;
}

