import { useState } from "react";
import { adminApi } from "../../api/admin.api";
import { useAuth } from "../../auth/useAuth";
import { Alert } from "../../shared/ui/Alert";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import { getErrorMessage } from "../../shared/utils/apiError";

export default function AdminBackups() {
  const { token, logout } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleIncremental = async () => {
    if (!token) return;
    setError(null);
    setMessage(null);
    try {
      setLoading(true);
      await adminApi.startIncrementalBackup(token, logout);
      setMessage("Backup incrémental lancé avec succès.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    if (!token) return;
    const confirmed = window.confirm(
      "Restaurer le dernier backup ? Cette action peut impacter le système.",
    );
    if (!confirmed) return;

    setError(null);
    setMessage(null);
    try {
      setLoading(true);
      await adminApi.restoreBackup(token, logout);
      setMessage("Restauration lancée.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Backups">
        <div className="space-y-3">
          {error ? <Alert type="error" message={error} /> : null}
          {message ? <Alert type="success" message={message} /> : null}
          <div className="flex flex-wrap gap-3">
            <Button onClick={handleIncremental} disabled={loading}>
              Lancer backup incrémental
            </Button>
            <Button variant="danger" onClick={handleRestore} disabled={loading}>
              Restaurer le dernier backup
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Toute action critique nécessite confirmation et feedback explicite.
          </p>
        </div>
      </Card>
    </div>
  );
}
