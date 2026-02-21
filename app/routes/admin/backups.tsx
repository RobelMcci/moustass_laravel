import { useState } from "react";
import { adminApi } from "../../api/admin.api";
import { useAuth } from "../../auth/useAuth";
import { Alert } from "../../shared/ui/Alert";
import { Button } from "../../shared/ui/Button";
import { getErrorMessage } from "../../shared/utils/apiError";

export default function AdminBackups() {
  const { token, logout } = useAuth();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [action, setAction] = useState<"incremental" | "restore" | null>(null);

  const handleIncremental = async () => {
    if (!token) return;
    setError(null);
    setMessage(null);
    setAction("incremental");
    try {
      setLoading(true);
      await adminApi.startIncrementalBackup(token, logout);
      setMessage("✓ Backup incrémental lancé avec succès.");
    } catch (err) {
      setError("Erreur lors du démarrage du backup.");
    } finally {
      setLoading(false);
      setAction(null);
    }
  };

  const handleRestore = async () => {
    if (!token) return;
    const confirmed = window.confirm(
      "⚠️ Restaurer le dernier backup ? Cette action est irréversible et peut causer une perte de données récentes.",
    );
    if (!confirmed) return;

    setError(null);
    setMessage(null);
    setAction("restore");
    try {
      setLoading(true);
      await adminApi.restoreBackup(token, logout);
      setMessage("✓ Restauration lancée. Le système va redémarrer.");
    } catch (err) {
      setError("Erreur lors de la restauration.");
    } finally {
      setLoading(false);
      setAction(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Gestion des backups
        </h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Effectuez et restaurez les sauvegardes du système.
        </p>
      </div>

      {/* Alerts */}
      <div className="space-y-3">
        {error ? <Alert type="error" message={error} /> : null}
        {message ? <Alert type="success" message={message} /> : null}
      </div>

      {/* Main actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Backup Card */}
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-950">
            <svg
              className="h-6 w-6 text-blue-600 dark:text-blue-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Créer un backup
          </h3>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            Lancez un backup incrémental du système. Cette opération peut prendre plusieurs minutes.
          </p>
          <Button
            onClick={handleIncremental}
            disabled={loading}
            className="w-full"
          >
            {loading && action === "incremental"
              ? "Backup en cours…"
              : "Lancer le backup"}
          </Button>
        </div>

        {/* Restore Card */}
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-8 dark:border-orange-900/50 dark:bg-orange-950/30">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-950">
            <svg
              className="h-6 w-6 text-orange-600 dark:text-orange-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900 dark:text-gray-100">
            Restaurer un backup
          </h3>
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            Restaurez le dernier backup disponible. Les données récentes seront perdues.
          </p>
          <Button
            variant="danger"
            onClick={handleRestore}
            disabled={loading}
            className="w-full"
          >
            {loading && action === "restore"
              ? "Restauration en cours…"
              : "Restaurer"}
          </Button>
        </div>
      </div>

      {/* Info Section */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
          À propos des backups
        </h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              Les backups incrémentiels ne sauvegardent que les changements depuis le dernier backup.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              Une restauration remplace les données actuelles par celles du backup sélectionné.
            </span>
          </li>
          <li className="flex items-start gap-3">
            <svg
              className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              Consultez l'historique des backups pour voir toutes les sauvegardes disponibles.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
