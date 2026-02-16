import { Link, Outlet } from "react-router";
import { ProtectedRoute } from "../../auth/ProtectedRoute";
import { useAuth } from "../../auth/useAuth";
import { Button } from "../../shared/ui/Button";

export default function ClientLayout() {
  const { logout, user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["CLIENT", "ADMIN"]} redirectTo="/login">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div>
              <Link to="/" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Moustass Client
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
            <nav className="flex items-center gap-3">
              <Link to="/client" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300">
                Accueil
              </Link>
              <Link to="/client/inbox" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300">
                Inbox
              </Link>
              <Link to="/client/audio" className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-300">
                Audio
              </Link>
              <Button variant="ghost" onClick={logout}>
                Déconnexion
              </Button>
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-10">
          <Outlet />
        </main>
      </div>
    </ProtectedRoute>
  );
}
