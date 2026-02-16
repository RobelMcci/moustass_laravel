BACKEND — TÂCHES DÉTAILLÉES
# A. Authentification
## Endpoints
    POST /auth/register
    POST /auth/login
    GET  /auth/me

## Tâches

    Hash mot de passe (bcrypt ou Argon2)
    Génération JWT
    Vérification règles password
    Vérification statut user
    (Option) génération client_secret
    (Option) validation HMAC (timestamp + nonce)

## Règles critiques

    Aucun mot de passe en clair
    HTTPS obligatoire
    JWT signé et expiré
    Anti-replay si HMAC

# B. Autorisation (Middleware)
## Tâches

    Middleware JWT
    Middleware rôle
    Protection stricte des routes

## Règles

    /admin/** → ADMIN only

    /auth/me → user connecté

    Toute route sensible protégée

# C. Administration
## Endpoints
    GET    /admin/users
    POST   /admin/users
    PUT    /admin/users/{id}
    DELETE /admin/users/{id}

## Tâches

    CRUD users
    Validation email unique
    Gestion rôle
    Gestion status
    Logs propres

# D. Sauvegarde & Restauration
## Endpoints
    POST /admin/backups/incremental
    POST /admin/backups/restore
    GET  /admin/backups/history

## Tâches

    Script mysqldump
    Gestion fichiers backup
    Écriture backups_log
    Restore full + incremental
    Gestion erreurs restore

# E. Intégration autres équipes
## Endpoint requis
    GET /users

## Règles

    Retourne uniquement users actifs
    Champs minimum (id, email)
    Protégé par JWT

# Côté base de donnée

## Table backups_log

    Champ	Règle
    id	    PK
    type	full / incremental
    created_at	auto
    file_path	obligatoire
    status	success / failed
    notes	texte

## Table users
    champ   Règle
    id_users      PK
    nom     varchar
    prenom  varchar
    mail    varchar
    motdepass   varchar
    role    bool (admin/users)

# RÈGLES NON NÉGOCIABLES

    HTTPS partout
    Aucun secret en clair
    JWT obligatoire
    RBAC strict
    GitHub avec branches + PR
    Même version sur les deux laptops
    Démo reproductible
    Logs propres (sans données sensibles)