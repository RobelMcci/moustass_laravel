import { Link, Outlet, useLocation } from "react-router";
import { ProtectedRoute } from "../../auth/ProtectedRoute";
import { useAuth } from "../../auth/useAuth";
import { Button } from "../../shared/ui/Button";

export default function ClientLayout() {
  const { logout, user } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <ProtectedRoute allowedRoles={["CLIENT", "ADMIN"]} redirectTo="/login">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
        <header className="border-b border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div>
              <Link
                to="/client"
                className="text-lg font-bold text-gray-900 dark:text-gray-100"
              >
                Moustass
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
            </div>
            <nav className="flex items-center gap-1">
              <Link
                to="/client"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive("/client")
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                Accueil
              </Link>
              <Link
                to="/client/inbox"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive("/client/inbox")
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                Inbox
              </Link>
              <Link
                to="/client/audio"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive("/client/audio")
                    ? "bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
                }`}
              >
                Audio
              </Link>
              <div className="ml-2 border-l border-gray-200 pl-2 dark:border-gray-700">
                <Button variant="ghost" onClick={logout} className="text-sm">
                  Déconnexion
                </Button>
              </div>
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
