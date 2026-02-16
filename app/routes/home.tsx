import type { Route } from "./+types/home";
import { Link } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Moustass Auth" },
    { name: "description", content: "Client & Admin access" },
  ];
}

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 px-6 py-16 dark:bg-gray-950">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-gray-200 bg-white p-10 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h1 className="text-3xl font-semibold text-gray-900 dark:text-gray-100">
            Moustass Auth Frontend
          </h1>
          <p className="mt-3 text-gray-600 dark:text-gray-300">
            Accès client et administration, strictement alignés avec le backend.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link
              to="/login"
              className="rounded-2xl border border-blue-200 bg-blue-50 px-5 py-4 text-blue-700 transition hover:border-blue-300 hover:bg-blue-100 dark:border-blue-900/50 dark:bg-blue-950 dark:text-blue-200"
            >
              <div className="text-lg font-semibold">Espace Client</div>
              <div className="mt-1 text-sm text-blue-700/80 dark:text-blue-200/70">
                Se connecter et accéder à l’inbox.
              </div>
            </Link>
            <Link
              to="/admin/login"
              className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-amber-800 transition hover:border-amber-300 hover:bg-amber-100 dark:border-amber-900/50 dark:bg-amber-950 dark:text-amber-200"
            >
              <div className="text-lg font-semibold">Espace Admin</div>
              <div className="mt-1 text-sm text-amber-800/80 dark:text-amber-200/70">
                Gérer les utilisateurs et les backups.
              </div>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
