import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router";
import { adminApi, type AdminUser } from "../../api/admin.api";
import { useAuth } from "../../auth/useAuth";
import { Alert } from "../../shared/ui/Alert";
import { Button } from "../../shared/ui/Button";
import { Select } from "../../shared/ui/Select";

export default function AdminUserEdit() {
  const { id } = useParams();
  const { token, logout } = useAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [role, setRole] = useState<"ADMIN" | "CLIENT">("CLIENT");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE" | "SUSPENDED">(
    "ACTIVE",
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      if (!token || !id) return;
      setLoading(true);
      try {
        const data = await adminApi.listUsers(token, logout);
        const found = data.find((item) => item.id === id) ?? null;
        setUser(found);
        if (found) {
          setRole(found.role);
          setStatus(found.status);
        }
      } catch (err) {
        setError("Impossible de charger l'utilisateur.");
      } finally {
        setLoading(false);
      }
    };

    void loadUser();
  }, [token, id, logout]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);
    if (!token || !id) return;

    try {
      setSaving(true);
      await adminApi.updateUser(token, id, { role, status }, logout);
      setSuccess("Utilisateur modifié avec succès.");
      setTimeout(() => navigate("/admin", { replace: true }), 1500);
    } catch (err) {
      setError("Impossible de modifier l'utilisateur.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Chargement…
          </h1>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm text-gray-500">Chargement de l'utilisateur…</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Erreur
          </h1>
        </div>
        <Alert type="error" message="Utilisateur introuvable." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Modifier l'utilisateur
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {user.email}
          </p>
        </div>
        <Button
          type="button"
          variant="ghost"
          onClick={() => navigate("/admin")}
        >
          ← Retour
        </Button>
      </div>

      {/* Form Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {error ? <Alert type="error" message={error} /> : null}
        {success ? <Alert type="success" message={success} /> : null}

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div>
            <h2 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Informations du compte
            </h2>
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-950">
              <div className="space-y-2">
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    Email
                  </p>
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user.email}
                  </p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    ID utilisateur
                  </p>
                  <p className="text-xs font-mono text-gray-600 dark:text-gray-400">
                    {user.id}
                  </p>
                </div>
                {user.createdAt && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                      Créé le
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                )}
              </div>
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
            <Button type="submit" disabled={saving}>
              {saving ? "Enregistrement…" : "Enregistrer les modifications"}
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
