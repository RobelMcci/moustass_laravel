import { useEffect, useState, type FormEvent } from "react";
import { useNavigate, useParams } from "react-router";
import { adminApi, type AdminUser } from "../../api/admin.api";
import { useAuth } from "../../auth/useAuth";
import { Alert } from "../../shared/ui/Alert";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import { Select } from "../../shared/ui/Select";
import { getErrorMessage } from "../../shared/utils/apiError";

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
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void loadUser();
  }, [token, id, logout]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!token || !id) return;

    try {
      setSaving(true);
      await adminApi.updateUser(token, id, { role, status }, logout);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Chargement…</p>;
  }

  if (!user) {
    return <Alert type="error" message="Utilisateur introuvable." />;
  }

  return (
    <Card title={`Modifier ${user.email}`}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error ? <Alert type="error" message={error} /> : null}
        <Select
          label="Rôle"
          value={role}
          onChange={(event) => setRole(event.target.value as "ADMIN" | "CLIENT")}
        >
          <option value="CLIENT">CLIENT</option>
          <option value="ADMIN">ADMIN</option>
        </Select>
        <Select
          label="Statut"
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as "ACTIVE" | "INACTIVE" | "SUSPENDED")
          }
        >
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
          <option value="SUSPENDED">SUSPENDED</option>
        </Select>
        <div className="flex gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Enregistrement…" : "Enregistrer"}
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
    </Card>
  );
}
