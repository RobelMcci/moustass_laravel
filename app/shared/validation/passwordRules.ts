export type PasswordRule = {
  label: string;
  test: (password: string) => boolean;
  met: boolean;
};

export function getPasswordRules(
  password: string,
  minLength: number = 12,
): PasswordRule[] {
  return [
    {
      label: `Au moins ${minLength} caractères`,
      test: (pwd) => pwd.length >= minLength,
      met: password.length >= minLength,
    },
    {
      label: "Au moins 1 majuscule",
      test: (pwd) => /[A-Z]/.test(pwd),
      met: /[A-Z]/.test(password),
    },
    {
      label: "Au moins 1 minuscule",
      test: (pwd) => /[a-z]/.test(pwd),
      met: /[a-z]/.test(password),
    },
    {
      label: "Au moins 1 chiffre",
      test: (pwd) => /[0-9]/.test(pwd),
      met: /[0-9]/.test(password),
    },
    {
      label: "Au moins 1 caractère spécial",
      test: (pwd) => /[^A-Za-z0-9]/.test(pwd),
      met: /[^A-Za-z0-9]/.test(password),
    },
  ];
}

export function isPasswordValid(rules: PasswordRule[]): boolean {
  return rules.every((rule) => rule.met);
}
