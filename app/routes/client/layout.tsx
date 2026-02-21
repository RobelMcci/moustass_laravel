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
      <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-950">
        <header className="border-b border-gray-700 bg-gray-900/60 shadow-lg backdrop-blur-sm">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div>
              <Link
                to="/client"
                className="text-lg font-bold text-white"
              >
                Moustass
              </Link>
              <p className="text-xs text-gray-400">
                {user?.email}
              </p>
            </div>
            <nav className="flex items-center gap-1">
              <Link
                to="/client"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive("/client")
                    ? "bg-blue-900 text-blue-400"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                }`}
              >
                Accueil
              </Link>
              <Link
                to="/client/inbox"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive("/client/inbox")
                    ? "bg-blue-900 text-blue-400"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                }`}
              >
                Inbox
              </Link>
              <Link
                to="/client/audio"
                className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                  isActive("/client/audio")
                    ? "bg-blue-900 text-blue-400"
                    : "text-gray-400 hover:bg-gray-800 hover:text-gray-200"
                }`}
              >
                Audio
              </Link>
              <div className="ml-2 border-l border-gray-700 pl-2">
                <Button variant="ghost" onClick={logout} className="text-sm text-gray-400 hover:text-gray-200">
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
