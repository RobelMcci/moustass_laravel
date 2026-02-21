import { Card } from "../../shared/ui/Card";

export default function ClientInbox() {
  return (
    <div className="space-y-6">
      <Card title="Inbox">
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="mt-4 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Aucun message
          </h3>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            L'inbox client sera disponible prochainement.
          </p>
        </div>
      </Card>
    </div>
  );
}
