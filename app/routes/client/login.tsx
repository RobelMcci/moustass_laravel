import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../auth/useAuth";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import { Input } from "../../shared/ui/Input";
import { Alert } from "../../shared/ui/Alert";
import { getErrorMessage } from "../../shared/utils/apiError";
import { validatePassword } from "../../shared/validation/password";

export default function ClientLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const validation = validatePassword(password, "CLIENT");
    if (!validation.isValid) {
      setError(validation.message ?? "Mot de passe invalide.");
      return;
    }

    try {
      setLoading(true);
      await login(email, password);
      navigate("/client", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16 dark:bg-gray-950">
      <div className="mx-auto max-w-md">
        <Card title="Connexion Client">
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
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Connexion…" : "Se connecter"}
            </Button>
          </form>
        </Card>
      </div>
    </main>
  );
}
