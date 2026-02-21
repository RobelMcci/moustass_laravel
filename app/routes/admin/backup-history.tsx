import { useEffect, useState } from "react";
import { adminApi } from "../../api/admin.api";
import { useAuth } from "../../auth/useAuth";
import { Alert } from "../../shared/ui/Alert";

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
        setError("Impossible de charger l'historique des backups.");
      } finally {
        setLoading(false);
      }
    };

    void loadHistory();
  }, [token, logout]);

  const getStatusBadge = (status?: string) => {
    switch (status?.toUpperCase()) {
      case "SUCCESS":
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
            ✓ Succès
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-1 text-xs font-semibold text-red-800 dark:bg-red-950 dark:text-red-300">
            ✕ Échoué
          </span>
        );
      case "PENDING":
        return (
          <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-1 text-xs font-semibold text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300">
            ⏳ En attente
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-semibold text-gray-800 dark:bg-gray-800 dark:text-gray-300">
            ? Inconnu
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Historique des backups
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Consultez tous les backups disponibles et leur statut.
        </p>
      </div>

      {/* Alerts */}
      {error && <Alert type="error" message={error} />}

      {/* Card */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        {loading ? (
          <div className="flex h-32 items-center justify-center p-6">
            <p className="text-sm text-gray-500">Chargement de l'historique…</p>
          </div>
        ) : history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <svg
              className="h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
              Aucun backup
            </h3>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Aucun backup n'a encore été créé.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800">
                  <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Identifiant
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Date de création
                  </th>
                  <th className="px-6 py-3 text-left font-semibold text-gray-700 dark:text-gray-300">
                    Statut
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {history.map((item) => (
                  <tr
                    key={item.id}
                    className="transition hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-mono text-xs text-gray-600 dark:text-gray-400">
                          {item.id.slice(0, 12)}…
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {new Date(item.createdAt).toLocaleDateString("fr-FR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(item.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
