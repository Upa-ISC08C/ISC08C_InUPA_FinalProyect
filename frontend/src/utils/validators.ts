const UPA_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@alumnos\.upa\.edu\.mx$/;

export function isValidUpaEmail(email: string): boolean {
  return UPA_EMAIL_REGEX.test(email);
}

export function isRequired(value: string | undefined | null): boolean {
  return Boolean(value && value.trim().length > 0);
}

export function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
