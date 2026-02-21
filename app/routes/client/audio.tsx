import { Card } from "../../shared/ui/Card";

export default function ClientAudio() {
  return (
    <div className="space-y-6">
      <Card title="Audio">
        <div className="py-12 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <svg
              className="h-8 w-8 text-gray-400"
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
          <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Aucun contenu audio
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Les fonctionnalités audio seront intégrées ici.
          </p>
        </div>
      </Card>
    </div>
  );
}
