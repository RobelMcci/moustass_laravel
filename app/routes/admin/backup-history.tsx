import { useEffect, useState } from "react";
import { adminApi } from "../../api/admin.api";
import { useAuth } from "../../auth/useAuth";
import { Alert } from "../../shared/ui/Alert";
import { Card } from "../../shared/ui/Card";
import { getErrorMessage } from "../../shared/utils/apiError";

export default function AdminBackupHistory() {
  const { token, logout } = useAuth();
  const [history, setHistory] = useState<
    Array<{ id: string; createdAt: string; status?: string }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      if (!token) return;
      setLoading(true);
      setError(null);
      try {
        const data = await adminApi.backupHistory(token, logout);
        setHistory(data);
      } catch (err) {
        setError(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };

    void loadHistory();
  }, [token, logout]);

  return (
    <Card title="Historique des backups">
      {error ? <Alert type="error" message={error} /> : null}
      {loading ? (
        <p className="text-sm text-gray-500">Chargement…</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs uppercase text-gray-500">
              <tr>
                <th className="py-2">Identifiant</th>
                <th>Date</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {history.map((item) => (
                <tr key={item.id} className="text-gray-700 dark:text-gray-200">
                  <td className="py-3">{item.id}</td>
                  <td>{item.createdAt}</td>
                  <td>{item.status ?? "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
