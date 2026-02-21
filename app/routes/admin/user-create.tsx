import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { adminApi } from "../../api/admin.api";
import { useAuth } from "../../auth/useAuth";
import { Alert } from "../../shared/ui/Alert";
import { Button } from "../../shared/ui/Button";
import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import {
  getPasswordRules,
  isPasswordValid,
  type PasswordRule,
} from "../../shared/validation/passwordRules";

export default function AdminUserCreate() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "CLIENT">("CLIENT");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE" | "SUSPENDED">(
    "ACTIVE",
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const minLength = role === "ADMIN" ? 15 : 12;
  const passwordRules = getPasswordRules(password, minLength);
  const isPasswordStrong = isPasswordValid(passwordRules);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!isPasswordStrong) {
      setError("Le mot de passe ne respecte pas les critères requis.");
      return;
    }

    if (!token) return;

    try {
      setLoading(true);
      await adminApi.createUser(
        token,
        {
          email,
          password,
          role,
          status,
        },
        logout,
      );
      navigate("/admin", { replace: true });
    } catch (err) {
      setError("Impossible de créer l'utilisateur.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Créer un nouvel utilisateur
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Remplissez les informations ci-dessous pour ajouter un nouvel utilisateur.
        </p>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {error ? <Alert type="error" message={error} /> : null}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Informations de compte
            </h2>
            <div className="space-y-4">
              <Input
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="utilisateur@example.com"
                required
              />

              <div className="relative">
                <Input
                  label={`Mot de passe ${role === "ADMIN" ? "(15+ caractères)" : "(12+ caractères)"}`}
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  placeholder="••••••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute bottom-2.5 right-3 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400"
                >
                  {showPassword ? "Masquer" : "Afficher"}
                </button>
              </div>

              {/* Password requirements */}
              {(passwordFocused || password.length > 0) && (
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-950">
                  <p className="mb-3 text-xs font-semibold text-gray-700 dark:text-gray-300">
                    Critères du mot de passe :
                  </p>
                  <ul className="space-y-2">
                    {passwordRules.map((rule, index) => (
                      <PasswordRuleItem key={index} rule={rule} />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-800 pt-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Permissions et statut
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label="Rôle"
                value={role}
                onChange={(e) =>
                  setRole(e.target.value as "ADMIN" | "CLIENT")
                }
              >
                <option value="CLIENT">CLIENT</option>
                <option value="ADMIN">ADMIN</option>
              </Select>

              <Select
                label="Statut"
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value as "ACTIVE" | "INACTIVE" | "SUSPENDED",
                  )
                }
              >
                <option value="ACTIVE">Actif</option>
                <option value="INACTIVE">Inactif</option>
                <option value="SUSPENDED">Suspendu</option>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 border-t border-gray-200 pt-6 dark:border-gray-800">
            <Button type="submit" disabled={loading || !isPasswordStrong}>
              {loading ? "Création en cours…" : "Créer l'utilisateur"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate("/admin")}
            >
              Annuler
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PasswordRuleItem({ rule }: { rule: PasswordRule }) {
  return (
    <li className="flex items-center gap-2 text-xs">
      <span
        className={`flex h-4 w-4 items-center justify-center rounded-full ${
          rule.met
            ? "bg-emerald-500 text-white"
            : "border border-gray-300 bg-white dark:border-gray-700 dark:bg-gray-900"
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
            ? "text-emerald-700 dark:text-emerald-400"
            : "text-gray-600 dark:text-gray-400"
        }
      >
        {rule.label}
      </span>
    </li>
  );
}
