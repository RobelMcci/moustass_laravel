import { Card } from "../../shared/ui/Card";
import { useAuth } from "../../auth/useAuth";

export default function ClientDashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-indigo-700 bg-gradient-to-br from-indigo-900 to-gray-900 p-8 shadow-lg">
        <h1 className="text-2xl font-bold text-white">
          Bienvenue sur Moustass
        </h1>
        <p className="mt-2 text-sm text-gray-300">
          Connecté en tant que <span className="font-semibold">{user?.email}</span>
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-900 text-blue-400">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">
                Inbox
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                Consultez vos messages et notifications (bientôt disponible).
              </p>
            </div>
          </div>
        </Card>

        <Card>
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-900 text-indigo-400">
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-white">
                Audio
              </h3>
              <p className="mt-1 text-sm text-gray-400">
                Accédez à vos contenus audio (bientôt disponible).
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Card title="Statut du compte">
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Email</span>
            <span className="font-medium text-white">
              {user?.email}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Rôle</span>
            <span className="inline-flex items-center rounded-full bg-blue-900 px-2.5 py-0.5 text-xs font-semibold text-blue-200">
              {user?.role}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">Statut</span>
            <span className="inline-flex items-center rounded-full bg-emerald-900 px-2.5 py-0.5 text-xs font-semibold text-emerald-200">
              {user?.status ?? "ACTIVE"}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
