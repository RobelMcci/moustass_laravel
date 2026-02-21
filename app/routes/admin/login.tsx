import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../auth/useAuth";
import { Button } from "../../shared/ui/Button";
import { Input } from "../../shared/ui/Input";
import { Alert } from "../../shared/ui/Alert";
import {
  getPasswordRules,
  isPasswordValid,
  type PasswordRule,
} from "../../shared/validation/passwordRules";

export default function AdminLogin() {
  const { login, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const passwordRules = getPasswordRules(password, 15);
  const isPasswordStrong = isPasswordValid(passwordRules);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!isPasswordStrong) {
      setError("Le mot de passe ne respecte pas les critères requis.");
      return;
    }

    try {
      setLoading(true);
      const profile = await login(email, password);
      if (profile.role !== "ADMIN") {
        logout();
        setError("Accès administrateur refusé.");
        return;
      }
      navigate("/admin", { replace: true });
    } catch (err) {
      setError("Identifiants administrateur invalides.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-950 via-gray-900 to-gray-950 px-6 py-16">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg">
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
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">Moustass Admin</h1>
          <p className="mt-2 text-sm text-gray-400">
            Portail d'administration sécurisé
          </p>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-700 bg-gray-900/60 shadow-2xl backdrop-blur-sm">
          <div className="p-8">
            {error && <Alert type="error" message={error} />}

            {/* Warning for admin */}
            <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-900/50 bg-amber-950/40 p-3">
              <svg
                className="h-5 w-5 flex-shrink-0 text-amber-500"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-xs font-medium text-amber-200">
                Accès à cet espace réservé aux administrateurs uniquement.
              </span>
            </div>

            <form className="space-y-5" onSubmit={handleSubmit}>
              <Input
                label="Email administrateur"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required
                autoComplete="email"
              />

              <div className="relative">
                <Input
                  label="Mot de passe administrateur"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  placeholder="••••••••••••••••"
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

              {/* Password requirements for ADMIN (15 chars) */}
              {(passwordFocused || password.length > 0) && (
                <div className="rounded-xl border border-gray-700 bg-gray-950 p-4">
                  <p className="mb-3 text-xs font-semibold text-gray-300">
                    Critères admin (15+ caractères) :
                  </p>
                  <ul className="space-y-2">
                    {passwordRules.map((rule, index) => (
                      <PasswordRuleItem key={index} rule={rule} />
                    ))}
                  </ul>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading || !isPasswordStrong}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
              >
                {loading ? "Authentification…" : "Accéder au portail"}
              </Button>
            </form>
          </div>

          {/* Footer */}
          <div className="border-t border-gray-700 bg-gray-950/40 px-8 py-4">
            <p className="text-center text-xs text-gray-500">
              Tous les accès sont enregistrés et sécurisés.
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
