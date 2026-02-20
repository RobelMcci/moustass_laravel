1. Lecture des règles backend et identification des exigences (JWT, RBAC, HTTPS, schémas DB, endpoints).

2. Mise à jour du schéma `users` selon les champs obligatoires et ajout de la table `backups_log`.

3. Création des couches séparées : controllers, services, repositories, middlewares.

4. Implémentation JWT (génération/validation) et des middlewares `jwt` + `role` + HTTPS forcé.

5. Implémentation des endpoints REST (auth, users, admin/users, admin/backups).

6. Ajout de la logique de sauvegarde/restauration MySQL avec journalisation dans `backups_log`.

7. Nettoyage des routes web pour un module API-only et ajout des routes API dédiées.

8. Mise à jour du README technique et de la documentation des endpoints.

package à installer : composer require tymon/jwt-auth
php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"

php artisan jwt:secret


créatoin d'utilisateur et admin par defaut pour le teste : 
php artisan db:seed --class=UserSeeder

curl -X POST https://www.moustass.com/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "Alice@123456789"
  }'

curl -X POST https://www.moustass.com/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "email": "admin@example.com",
    "password": "Admin@123456789",
    "role": "ADMIN",
    "status": "active"
  }'