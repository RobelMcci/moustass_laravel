import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { adminApi } from "../../api/admin.api";
import { useAuth } from "../../auth/useAuth";
import { Alert } from "../../shared/ui/Alert";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import { Input } from "../../shared/ui/Input";
import { Select } from "../../shared/ui/Select";
import { getErrorMessage } from "../../shared/utils/apiError";
import { validatePassword } from "../../shared/validation/password";

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const validation = validatePassword(password, role);
    if (!validation.isValid) {
      setError(validation.message ?? "Mot de passe invalide.");
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
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Créer un utilisateur">
      <form className="space-y-4" onSubmit={handleSubmit}>
        {error ? <Alert type="error" message={error} /> : null}
        <Input
          label="Email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <Input
          label="Mot de passe"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          required
        />
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
          <Button type="submit" disabled={loading}>
            {loading ? "Création…" : "Créer"}
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
