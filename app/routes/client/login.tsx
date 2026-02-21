import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../auth/useAuth";
import { authApi } from "../../api/auth.api";
import { Button } from "../../shared/ui/Button";
import { Input } from "../../shared/ui/Input";
import { Alert } from "../../shared/ui/Alert";
import {
  getPasswordRules,
  isPasswordValid,
  type PasswordRule,
} from "../../shared/validation/passwordRules";

type AuthMode = "signin" | "signup";

export default function ClientLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const passwordRules = getPasswordRules(password, 12);
  const isPasswordStrong = isPasswordValid(passwordRules);

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    try {
      setLoading(true);
      await login(email, password);
      navigate("/client", { replace: true });
    } catch (err) {
      setError("Identifiants invalides.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (!isPasswordStrong) {
      setError("Le mot de passe ne respecte pas les critères requis.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      setLoading(true);
      await authApi.register({ email, password });
      setSuccess("Compte créé avec succès ! Vous pouvez maintenant vous connecter.");
      setMode("signin");
      setPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError("Impossible de créer le compte.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-950 via-gray-900 to-gray-950 px-6 py-16">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <svg
              className="h-8 w-8 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Moustass</h1>
          <p className="mt-2 text-sm text-gray-400">
            {mode === "signin"
              ? "Connectez-vous à votre espace client"
              : "Créez votre compte pour accéder aux services"}
          </p>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-900/60 shadow-2xl backdrop-blur-sm">
          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
                mode === "signin"
                  ? "border-b-2 border-blue-500 text-blue-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              Connexion
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
                setSuccess(null);
              }}
              className={`flex-1 px-6 py-4 text-sm font-semibold transition ${
                mode === "signup"
                  ? "border-b-2 border-blue-500 text-blue-400"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              Inscription
            </button>
          </div>

          {/* Form content */}
          <div className="p-8">
            {error && <Alert type="error" message={error} />}
            {success && <Alert type="success" message={success} />}

            {mode === "signin" ? (
              <form className="mt-6 space-y-5" onSubmit={handleSignIn}>
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  autoComplete="email"
                />
                <div className="relative">
                  <Input
                    label="Mot de passe"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute bottom-2.5 right-3 text-xs text-gray-400 hover:text-gray-200"
                  >
                    {showPassword ? "Masquer" : "Afficher"}
                  </button>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {loading ? "Connexion en cours…" : "Se connecter"}
                </Button>
              </form>
            ) : (
              <form className="mt-6 space-y-5" onSubmit={handleSignUp}>
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  autoComplete="email"
                />
                <div className="relative">
                  <Input
                    label="Mot de passe"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setPasswordFocused(true)}
                    placeholder="••••••••••••"
                    required
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute bottom-2.5 right-3 text-xs text-gray-400 hover:text-gray-200"
                  >
                    {showPassword ? "Masquer" : "Afficher"}
                  </button>
                </div>

                {/* Password strength indicator */}
                {(passwordFocused || password.length > 0) && (
                  <div className="rounded-xl border border-gray-700 bg-gray-950 p-4">
                    <p className="mb-3 text-xs font-semibold text-gray-300">
                      Critères du mot de passe :
                    </p>
                    <ul className="space-y-2">
                      {passwordRules.map((rule, index) => (
                        <PasswordRuleItem key={index} rule={rule} />
                      ))}
                    </ul>
                  </div>
                )}

                <Input
                  label="Confirmer le mot de passe"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  autoComplete="new-password"
                  error={
                    confirmPassword.length > 0 && password !== confirmPassword
                      ? "Les mots de passe ne correspondent pas"
                      : undefined
                  }
                />
                <Button
                  type="submit"
                  disabled={loading || !isPasswordStrong}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                >
                  {loading ? "Création en cours…" : "Créer mon compte"}
                </Button>
              </form>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-700 bg-gray-950/40 px-8 py-4">
            <p className="text-center text-xs text-gray-500">
              En créant un compte, vous acceptez nos conditions d'utilisation.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

function PasswordRuleItem({ rule }: { rule: PasswordRule }) {
  return (
    <li className="flex items-center gap-2 text-xs">
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full ${
          rule.met
            ? "bg-emerald-500 text-white"
            : "border border-gray-500 bg-gray-800"
        }`}
      >
        {rule.met ? (
          <svg
            className="h-3 w-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={3}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : null}
      </span>
      <span
        className={
          rule.met
            ? "text-emerald-400"
            : "text-gray-400"
        }
      >
        {rule.label}
      </span>
    </li>
  );
}
