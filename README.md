# Moustass Auth Backend

Module API REST pour l’authentification, l’autorisation RBAC, la gestion des utilisateurs et la sauvegarde/restauration MySQL.

## Prérequis

- PHP 8.2+
- MySQL 8+
- Composer
- `mysqldump` et `mysqlbinlog` disponibles sur l’hôte

## Configuration

Définir dans `.env` :

- `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- `JWT_SECRET` (secret JWT, recommandé)
- `JWT_TTL_MINUTES` (par défaut 20)

## Installation

1. Installer les dépendances Composer.
2. Exécuter les migrations.

## Sécurité

- HTTPS obligatoire (middleware global).
- Aucun secret ni mot de passe en clair.
- JWT signé, expiré, rôle inclus.

## Endpoints

### Publics

- `POST /auth/register`
- `POST /auth/login`
- `GET /health`

### Authentifiés

- `GET /auth/me`
- `GET /users` (actifs uniquement, champs: `id`, `email`)

### Admin (JWT + rôle ADMIN)

- `GET /admin/users`
- `POST /admin/users`
- `PUT /admin/users/{id}`
- `DELETE /admin/users/{id}`

- `POST /admin/backups/incremental`
- `POST /admin/backups/restore`
- `GET /admin/backups/history`

## Sauvegarde & restauration

- Première sauvegarde complète obligatoire.
- Sauvegardes incrémentales basées sur les binlogs MySQL.
- Restauration: full puis incréments.
- Chaque action est journalisée dans `backups_log`.
