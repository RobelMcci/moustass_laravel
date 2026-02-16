import { Card } from "../../shared/ui/Card";

export default function ClientDashboard() {
  return (
    <div className="space-y-6">
      <Card title="Bienvenue">
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Cet espace est prêt pour l’inbox et les fonctionnalités audio à venir.
        </p>
      </Card>
      <Card title="Prochaines étapes">
        <ul className="list-disc space-y-2 pl-5 text-sm text-gray-600 dark:text-gray-300">
          <li>Consulter l’inbox (bientôt disponible).</li>
          <li>Explorer les flux audio (bientôt disponible).</li>
        </ul>
      </Card>
    </div>
  );
}
