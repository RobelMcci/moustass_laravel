import type { Role } from "../../auth/AuthProvider";

export type PasswordRuleResult = {
  isValid: boolean;
  message?: string;
};

export function validatePassword(password: string, role: Role): PasswordRuleResult {
  const minLength = role === "ADMIN" ? 15 : 12;

  if (password.length < minLength) {
    return {
      isValid: false,
      message: `Le mot de passe doit contenir au moins ${minLength} caractères.`,
    };
  }
  if (!/[A-Z]/.test(password)) {
    return {
      isValid: false,
      message: "Le mot de passe doit contenir une majuscule.",
    };
  }
  if (!/[a-z]/.test(password)) {
    return {
      isValid: false,
      message: "Le mot de passe doit contenir une minuscule.",
    };
  }
  if (!/[0-9]/.test(password)) {
    return {
      isValid: false,
      message: "Le mot de passe doit contenir un chiffre.",
    };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return {
      isValid: false,
      message: "Le mot de passe doit contenir un caractère spécial.",
    };
  }
  return { isValid: true };
}
