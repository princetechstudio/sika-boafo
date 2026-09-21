export const passwordRequirements = "Use at least 8 characters with a lowercase letter, uppercase letter, number, and symbol.";

export function isStrongPassword(password: string): boolean {
  return password.length >= 8
    && /[a-z]/.test(password)
    && /[A-Z]/.test(password)
    && /\d/.test(password)
    && /[^A-Za-z0-9]/.test(password);
}
