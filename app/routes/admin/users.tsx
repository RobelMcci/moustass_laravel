import { useEffect, useState } from "react";
import { Link } from "react-router";
import { adminApi, type AdminUser } from "../../api/admin.api";
import { useAuth } from "../../auth/useAuth";
import { Alert } from "../../shared/ui/Alert";
import { Button } from "../../shared/ui/Button";
import { Card } from "../../shared/ui/Card";
import { getErrorMessage } from "../../shared/utils/apiError";

export default function AdminUsers() {
  const { token, logout } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadUsers = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.listUsers(token, logout);
      setUsers(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, [token, logout]);

  const handleDelete = async (user: AdminUser) => {
    if (!token) return;
    const confirmed = window.confirm(
      `Supprimer l’utilisateur ${user.email} ? Cette action est irréversible.`,
    );
    if (!confirmed) return;

    try {
      await adminApi.deleteUser(token, user.id, logout);
      setActionMessage("Utilisateur supprimé.");
      void loadUsers();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <Card
        title="Utilisateurs"
        actions={
          <Link to="/admin/users/new">
            <Button>Nouveau</Button>
          </Link>
        }
      >
        {error ? <Alert type="error" message={error} /> : null}
        {actionMessage ? <Alert type="success" message={actionMessage} /> : null}
        {loading ? (
          <p className="text-sm text-gray-500">Chargement…</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-gray-500">
                <tr>
                  <th className="py-2">Email</th>
                  <th>Rôle</th>
                  <th>Statut</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {users.map((user) => (
                  <tr key={user.id} className="text-gray-700 dark:text-gray-200">
                    <td className="py-3">{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.status}</td>
                    <td className="text-right">
                      <div className="inline-flex items-center gap-2">
                        <Link to={`/admin/users/${user.id}`}>
                          <Button variant="secondary">Modifier</Button>
                        </Link>
                        <Button variant="danger" onClick={() => handleDelete(user)}>
                          Supprimer
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
