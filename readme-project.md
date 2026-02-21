# Documentation complète du projet Moustass Auth

## Vue d'ensemble

**Moustass Auth** est un module backend autonome et stateless pour l'authentification, l'autorisation RBAC (Role-Based Access Control), la gestion des utilisateurs et la sauvegarde/restauration MySQL. Il s'agit d'une API REST construite avec Laravel 12 et PHP 8.2+.

## Principes architecturaux

- **API REST uniquement** : Aucune interface graphique, communication via JSON
- **Stateless** : Aucune session serveur, authentification par JWT
- **Sécurité stricte** : HTTPS obligatoire, hashage des mots de passe, pas de secrets en clair
- **Séparation des responsabilités** : Controllers → Services → Repositories → Models
- **RBAC** : Deux rôles (ADMIN, CLIENT) avec permissions strictes

---

## Structure du projet

```
moustass-project/
├── app/
│   ├── Http/
│   │   ├── Controllers/     # Contrôleurs REST
│   │   └── Middleware/      # Middlewares (JWT, RBAC, HTTPS)
│   ├── Models/              # Modèles Eloquent (User, BackupLog)
│   ├── Repositories/        # Couche d'accès aux données
│   └── Services/            # Logique métier
├── bootstrap/               # Initialisation Laravel
├── config/                  # Configuration (database, app, etc.)
├── database/
│   ├── migrations/          # Schémas de base de données
│   ├── factories/           # Factories pour les tests
│   └── seeders/             # Seeders (données initiales)
├── routes/
│   ├── api.php             # Routes API REST
│   └── web.php             # Routes web (vides)
├── storage/
│   └── app/backups/        # Fichiers de sauvegarde MySQL
├── tests/                  # Tests PHPUnit
├── composer.json           # Dépendances PHP
└── .env                    # Variables d'environnement
```

---

## Détail des dossiers et fichiers

### 📁 `app/Http/Controllers/`

Contrôleurs REST qui reçoivent les requêtes HTTP, appellent les services et retournent les réponses JSON.

#### `Controller.php`
Classe de base abstraite pour tous les contrôleurs.

#### `AuthController.php`
**Responsabilité** : Gère l'authentification des utilisateurs.

**Endpoints** :
- `POST /auth/register` : Inscription d'un nouveau CLIENT
- `POST /auth/login` : Connexion (retourne un JWT)
- `GET /auth/me` : Informations de l'utilisateur connecté (JWT requis)

**Méthodes** :
- `register(Request)` → Appelle `AuthService::register()`
- `login(Request)` → Appelle `AuthService::login()`
- `me(Request)` → Récupère l'ID utilisateur du JWT et appelle `AuthService::me()`

#### `UserController.php`
**Responsabilité** : Liste les utilisateurs actifs (pour intégration avec autres équipes).

**Endpoints** :
- `GET /users` : Retourne uniquement les utilisateurs actifs avec champs minimaux (`id`, `email`)

**Méthodes** :
- `index()` → Appelle `UserService::listActiveUsers()`

#### `AdminUserController.php`
**Responsabilité** : CRUD complet des utilisateurs (réservé aux ADMIN).

**Endpoints** :
- `GET /admin/users` : Liste tous les utilisateurs
- `POST /admin/users` : Créer un utilisateur (CLIENT ou ADMIN)
- `PUT /admin/users/{id}` : Modifier un utilisateur
- `DELETE /admin/users/{id}` : Désactiver un utilisateur (soft delete via status)

**Méthodes** :
- `index()` → Appelle `UserService::listAll()`
- `store(Request)` → Appelle `UserService::create()`
- `update(Request, $id)` → Appelle `UserService::update()`
- `destroy($id)` → Appelle `UserService::disable()`

#### `AdminBackupController.php`
**Responsabilité** : Sauvegarde et restauration de la base MySQL (réservé aux ADMIN).

**Endpoints** :
- `POST /admin/backups/incremental` : Déclenche une sauvegarde incrémentale
- `POST /admin/backups/restore` : Restaure la dernière sauvegarde complète + incréments
- `GET /admin/backups/history` : Historique des sauvegardes

**Méthodes** :
- `incremental()` → Appelle `BackupService::incrementalBackup()`
- `restore()` → Appelle `BackupService::restoreLatest()`
- `history()` → Appelle `BackupService::history()`

#### `HealthController.php`
**Responsabilité** : Endpoint de santé (utilisé par le health check natif de Laravel).

**Endpoints** :
- `GET /health` : Retourne `{"status": "ok"}`

---

### 📁 `app/Http/Middleware/`

Middlewares qui interceptent les requêtes avant qu'elles n'atteignent les contrôleurs.

#### `ForceHttps.php`
**Responsabilité** : Bloque toutes les requêtes HTTP non sécurisées.

**Logique** :
- Vérifie `$request->isSecure()`
- Si faux → Retourne 403 avec message "HTTPS required"
- Sinon → Continue vers le contrôleur

**Application** : Middleware global (appliqué à toutes les routes).

#### `JwtAuth.php`
**Responsabilité** : Vérifie la validité du JWT et charge l'utilisateur authentifié.

**Logique** :
1. Extrait le token du header `Authorization: Bearer <token>`
2. Décode le JWT via `JwtService::decodeToken()`
3. Vérifie que l'utilisateur existe et est actif
4. Attache `auth_user_id` et `auth_user_role` aux attributs de la requête
5. Continue vers le contrôleur

**Application** : Appliqué via `->middleware('jwt')` sur les routes protégées.

#### `RequireRole.php`
**Responsabilité** : Vérifie que l'utilisateur a le rôle requis.

**Logique** :
1. Récupère `auth_user_role` des attributs de la requête (injecté par JwtAuth)
2. Compare avec le rôle attendu (ex: "ADMIN")
3. Si différent → Retourne 403 "Forbidden"
4. Sinon → Continue vers le contrôleur

**Application** : Appliqué via `->middleware('role:ADMIN')` sur les routes admin.

#### `HandleCors.php`
Middleware Laravel par défaut pour gérer les CORS (non modifié).

---

### 📁 `app/Services/`

Couche métier contenant toute la logique applicative. Les services sont injectés dans les contrôleurs.

#### `JwtService.php`
**Responsabilité** : Génération et validation des JWT.

**Méthodes** :
- `createToken($userId, $role)` :
  - Crée un payload avec `user_id`, `role`, `iat`, `exp`
  - Signe avec HMAC-SHA256 en utilisant `JWT_SECRET` (ou `APP_KEY`)
  - Durée de vie configurable via `JWT_TTL_MINUTES` (défaut 20 min)
  - Retourne `['token' => '...', 'expires_in' => 1200]`

- `decodeToken($token)` :
  - Décode et vérifie la signature
  - Retourne le payload ou `null` si invalide/expiré

- `getSecret()` :
  - Récupère `JWT_SECRET` ou `APP_KEY` depuis `.env`
  - Décode si préfixé par `base64:`

**Dépendences** : `firebase/php-jwt`

#### `AuthService.php`
**Responsabilité** : Gestion de l'inscription, connexion et authentification.

**Méthodes** :
- `register($data)` :
  1. Valide `email` et `password`
  2. Vérifie l'unicité de l'email
  3. Valide le mot de passe (12 caractères min, majuscule, minuscule, chiffre, spécial)
  4. Hash le mot de passe avec `Hash::make()` (bcrypt par défaut)
  5. Crée l'utilisateur avec rôle `CLIENT` et status `active`
  6. Retourne les données utilisateur (sans JWT)

- `login($data)` :
  1. Valide `email` et `password`
  2. Vérifie les credentials via `Hash::check()`
  3. Vérifie que `status === 'active'`
  4. Génère un JWT via `JwtService::createToken()`
  5. Retourne le token et sa durée de vie

- `me($userId)` :
  1. Récupère l'utilisateur par ID
  2. Retourne ses informations (`id`, `email`, `role`, `status`)

- `validatePassword($password, $role)` :
  - CLIENT : ≥12 caractères
  - ADMIN : ≥15 caractères
  - Doit contenir : majuscule, minuscule, chiffre, caractère spécial
  - Retourne un tableau d'erreurs (vide si valide)

**Dépendances** : `UserRepository`, `JwtService`

#### `UserService.php`
**Responsabilité** : Gestion des utilisateurs (CRUD, listing).

**Méthodes** :
- `listActiveUsers()` :
  - Retourne uniquement les utilisateurs actifs avec champs `id`, `email`
  - Utilisé par l'endpoint public `/users`

- `listAll()` :
  - Retourne tous les utilisateurs avec tous les champs sauf les secrets
  - Utilisé par l'endpoint admin `GET /admin/users`

- `create($data)` :
  1. Valide `email`, `password`, `role`, `status`
  2. Vérifie unicité de l'email
  3. Valide le mot de passe selon le rôle
  4. Hash le mot de passe
  5. Crée l'utilisateur
  6. Retourne les données utilisateur

- `update($id, $data)` :
  1. Vérifie que l'utilisateur existe
  2. Valide les champs modifiables (`email`, `role`, `status`, `password`)
  3. Si nouveau mot de passe → valide et hash
  4. Met à jour l'utilisateur
  5. Retourne les données mises à jour

- `disable($id)` :
  1. Vérifie que l'utilisateur existe
  2. Change le status à `disabled`
  3. Retourne les données mises à jour

**Dépendances** : `UserRepository`

#### `BackupService.php`
**Responsabilité** : Sauvegarde et restauration MySQL avec support incrémental.

**Méthodes** :
- `incrementalBackup()` :
  1. Vérifie l'existence d'une sauvegarde complète (sinon la crée)
  2. Récupère le dernier état binlog via `SHOW MASTER STATUS`
  3. Lit la position de fin de la dernière sauvegarde (dans `notes`)
  4. Exporte les binlogs entre l'ancienne et la nouvelle position via `mysqlbinlog`
  5. Enregistre le fichier `incremental_YYYYMMDD_HHMMSS.sql`
  6. Journalise dans `backups_log` avec positions binlog

- `fullBackup()` :
  1. Exécute `mysqldump` avec options `--single-transaction`, `--routines`, `--events`, `--triggers`
  2. Enregistre le fichier `full_YYYYMMDD_HHMMSS.sql`
  3. Capture la position binlog actuelle
  4. Journalise dans `backups_log`

- `restoreLatest()` :
  1. Trouve la dernière sauvegarde complète réussie
  2. Restaure via `mysql < full_backup.sql`
  3. Rejoue les sauvegardes incrémentales dans l'ordre chronologique
  4. Journalise l'opération de restauration

- `history()` :
  - Retourne l'historique complet de `backups_log` (type, date, status, notes)

- Méthodes privées :
  - `importSql($filePath)` : Importe un fichier SQL via `mysql`
  - `getMasterStatus()` : Exécute `SHOW MASTER STATUS` et parse le résultat
  - `getMysqlConfig()` : Récupère les credentials MySQL depuis `.env`
  - `parseNotes($notes)` : Parse le JSON dans le champ `notes`

**Dépendances** : `BackupLogRepository`, `Symfony\Component\Process`

**Prérequis** : `mysqldump`, `mysqlbinlog`, `mysql` disponibles sur le système.

---

### 📁 `app/Repositories/`

Couche d'accès aux données. Les repositories encapsulent les requêtes Eloquent.

#### `UserRepository.php`
**Responsabilité** : Accès à la table `users`.

**Méthodes** :
- `findByEmail($email)` : Recherche par email
- `findById($id)` : Recherche par ID
- `create($data)` : Crée un utilisateur
- `update($user, $data)` : Met à jour un utilisateur
- `listAll()` : Retourne tous les utilisateurs avec champs principaux
- `listActiveMinimal()` : Retourne uniquement les utilisateurs actifs avec `id`, `email`

#### `BackupLogRepository.php`
**Responsabilité** : Accès à la table `backups_log`.

**Méthodes** :
- `create($data)` : Enregistre une entrée de log
- `lastFull()` : Retourne la dernière sauvegarde complète réussie
- `lastSuccessful()` : Retourne la dernière sauvegarde réussie (full ou incrémental)
- `listAfterFull($full)` : Retourne toutes les sauvegardes après une full donnée
- `history()` : Retourne l'historique complet

---

### 📁 `app/Models/`

Modèles Eloquent représentant les tables de la base de données.

#### `User.php`
**Table** : `users`

**Champs** :
- `id` : Clé primaire auto-incrémentée
- `email` : Email unique (index)
- `role` : ENUM('ADMIN', 'CLIENT')
- `password_hash` : Hash bcrypt du mot de passe
- `client_secret_hash` : Hash du client_secret (nullable, pour preuve de possession future)
- `status` : ENUM('active', 'disabled')
- `created_at`, `updated_at` : Timestamps

**Propriétés Eloquent** :
- `$fillable` : `['email', 'role', 'password_hash', 'client_secret_hash', 'status']`
- `$hidden` : `['password_hash', 'client_secret_hash']` (masqués dans les réponses JSON)

**Traits** :
- `Authenticatable` : Support de l'authentification Laravel (sans sessions)
- `HasFactory` : Support des factories pour les tests

#### `BackupLog.php`
**Table** : `backups_log`

**Champs** :
- `id` : Clé primaire
- `type` : ENUM('full', 'incremental')
- `file_path` : Chemin du fichier de backup
- `status` : ENUM('success', 'failed')
- `notes` : JSON contenant les métadonnées (positions binlog, messages d'erreur)
- `created_at`, `updated_at` : Timestamps

**Propriétés Eloquent** :
- `$fillable` : `['type', 'file_path', 'status', 'notes']`

---

### 📁 `database/migrations/`

Migrations de base de données définissant le schéma SQL.

#### `0001_01_01_000000_create_users_table.php`
**Responsabilité** : Crée la table `users`.

**Schéma** :
```php
Schema::create('users', function (Blueprint $table) {
    $table->id();
    $table->string('email')->unique();
    $table->enum('role', ['ADMIN', 'CLIENT']);
    $table->string('password_hash');
    $table->string('client_secret_hash')->nullable();
    $table->enum('status', ['active', 'disabled'])->default('active');
    $table->timestamps();
});
```

#### `2026_02_16_000003_create_backups_log_table.php`
**Responsabilité** : Crée la table `backups_log`.

**Schéma** :
```php
Schema::create('backups_log', function (Blueprint $table) {
    $table->id();
    $table->enum('type', ['full', 'incremental']);
    $table->string('file_path');
    $table->enum('status', ['success', 'failed']);
    $table->text('notes')->nullable();
    $table->timestamps();
});
```

#### `0001_01_01_000001_create_cache_table.php`
Table de cache Laravel (non utilisée dans ce module).

#### `0001_01_01_000002_create_jobs_table.php`
Table de queues Laravel (non utilisée dans ce module).

---

### 📁 `routes/`

#### `api.php`
**Responsabilité** : Définit toutes les routes API REST.

**Routes publiques** (aucune authentification) :
```php
GET  /health              → HealthController::index
POST /auth/register       → AuthController::register
POST /auth/login          → AuthController::login
```

**Routes authentifiées** (middleware `jwt`) :
```php
GET  /auth/me            → AuthController::me
GET  /users              → UserController::index
```

**Routes admin** (middlewares `jwt` + `role:ADMIN`) :
```php
GET    /admin/users           → AdminUserController::index
POST   /admin/users           → AdminUserController::store
PUT    /admin/users/{id}      → AdminUserController::update
DELETE /admin/users/{id}      → AdminUserController::destroy

POST   /admin/backups/incremental → AdminBackupController::incremental
POST   /admin/backups/restore     → AdminBackupController::restore
GET    /admin/backups/history     → AdminBackupController::history
```

**Préfixe** : Toutes les routes sont préfixées par `/api` (configuration Laravel).

#### `web.php`
Vide (module API-only, pas d'interface web).

---

### 📁 `bootstrap/`

#### `app.php`
**Responsabilité** : Configuration et initialisation de l'application Laravel.

**Modifications** :
- Activation des routes API (`api: __DIR__.'/../routes/api.php'`)
- Health check natif sur `/health`
- Middleware global `ForceHttps` (appliqué à toutes les routes)
- Alias de middlewares :
  - `jwt` → `JwtAuth::class`
  - `role` → `RequireRole::class`

---

### 📁 `storage/app/backups/`

**Responsabilité** : Stockage des fichiers de sauvegarde MySQL.

**Fichiers générés** :
- `full_YYYYMMDD_HHMMSS.sql` : Sauvegardes complètes (mysqldump)
- `incremental_YYYYMMDD_HHMMSS.sql` : Sauvegardes incrémentales (binlogs)

**Sécurité** : Ce dossier doit être protégé en écriture et accessible uniquement au serveur.

---

### 📁 `tests/`

#### `Feature/ExampleTest.php`
Test d'intégration vérifiant que `/health` retourne 200.

**Modifications** :
- Force HTTPS dans les tests via `withServerVariables(['HTTPS' => 'on'])`

#### `Unit/ExampleTest.php`
Test unitaire de base (non modifié).

---

### 📄 Fichiers de configuration

#### `composer.json`
**Dépendances ajoutées** :
- `firebase/php-jwt: ^6.10` : Bibliothèque JWT

#### `.env`
**Variables critiques** :
- `DB_CONNECTION=mysql`
- `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`
- `JWT_SECRET` : Secret pour signer les JWT (optionnel, utilise `APP_KEY` sinon)
- `JWT_TTL_MINUTES` : Durée de vie des JWT (défaut 20)

#### `phpunit.xml`
Configuration PHPUnit (non modifié).

---

## Flux d'authentification détaillé

### 1️⃣ Inscription (`POST /auth/register`)

```
┌─────────────┐
│   Client    │
│  (Browser,  │
│  Postman,   │
│  Mobile App)│
└──────┬──────┘
       │
       │ POST /api/auth/register
       │ Content-Type: application/json
       │ {
       │   "email": "user@example.com",
       │   "password": "MyPassword#123"
       │ }
       │
       ▼
┌──────────────────────────────────────┐
│  Middleware: ForceHttps              │
│  ────────────────────────────────   │
│  - Vérifie que la requête est HTTPS │
│  - Si HTTP → 403 "HTTPS required"   │
│  - Sinon → Continue                  │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Controller: AuthController          │
│  ────────────────────────────────   │
│  - Méthode: register(Request)        │
│  - Extrait les données de la requête│
│  - Appelle AuthService::register()  │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Service: AuthService                │
│  ────────────────────────────────   │
│  1. Validation des champs            │
│     - email (format valide)          │
│     - password (non vide)            │
│                                       │
│  2. Vérification unicité de l'email  │
│     - Appelle UserRepository         │
│     - Si existe → Erreur 422         │
│                                       │
│  3. Validation du mot de passe       │
│     - ≥12 caractères (CLIENT)        │
│     - ≥15 caractères (ADMIN)         │
│     - ≥1 majuscule                   │
│     - ≥1 minuscule                   │
│     - ≥1 chiffre                     │
│     - ≥1 caractère spécial           │
│     - Si invalide → Erreur 422       │
│                                       │
│  4. Hashage du mot de passe          │
│     - Hash::make($password)          │
│     - Utilise bcrypt (coût 10)       │
│                                       │
│  5. Création de l'utilisateur        │
│     - Appelle UserRepository::create │
│     - Données: email, role=CLIENT,   │
│       password_hash, status=active   │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Repository: UserRepository          │
│  ────────────────────────────────   │
│  - Crée une entrée dans `users`      │
│  - Eloquent: User::create($data)     │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Database: users                     │
│  ────────────────────────────────   │
│  INSERT INTO users (email, role,     │
│    password_hash, status,            │
│    created_at, updated_at)           │
│  VALUES (...)                        │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Réponse HTTP 201 Created            │
│  ────────────────────────────────   │
│  {                                   │
│    "id": 42,                         │
│    "email": "user@example.com",      │
│    "role": "CLIENT",                 │
│    "status": "active"                │
│  }                                   │
│                                       │
│  Note: Pas de JWT retourné à         │
│  l'inscription. L'utilisateur doit   │
│  ensuite se connecter avec /login.   │
└──────────────────────────────────────┘
```

---

### 2️⃣ Connexion (`POST /auth/login`)

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ POST /api/auth/login
       │ Content-Type: application/json
       │ {
       │   "email": "user@example.com",
       │   "password": "MyPassword#123"
       │ }
       │
       ▼
┌──────────────────────────────────────┐
│  Middleware: ForceHttps              │
│  - Vérifie HTTPS                     │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Controller: AuthController          │
│  - Méthode: login(Request)           │
│  - Appelle AuthService::login()      │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Service: AuthService                │
│  ────────────────────────────────   │
│  1. Validation des champs            │
│     - email (format valide)          │
│     - password (non vide)            │
│                                       │
│  2. Recherche de l'utilisateur       │
│     - UserRepository::findByEmail()  │
│     - Si introuvable → Erreur 401    │
│                                       │
│  3. Vérification du mot de passe     │
│     - Hash::check($password,         │
│         $user->password_hash)        │
│     - Si faux → Erreur 401           │
│                                       │
│  4. Vérification du statut           │
│     - Si status != 'active'          │
│       → Erreur 403 "User not active" │
│                                       │
│  5. Génération du JWT                │
│     - Appelle JwtService::createToken│
│       ($user->id, $user->role)       │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Service: JwtService                 │
│  ────────────────────────────────   │
│  1. Création du payload              │
│     {                                │
│       "user_id": 42,                 │
│       "role": "CLIENT",              │
│       "iat": 1708531200,   (temps)   │
│       "exp": 1708532400    (20 min)  │
│     }                                │
│                                       │
│  2. Signature du token               │
│     - Algorithme: HS256 (HMAC-SHA256)│
│     - Secret: JWT_SECRET ou APP_KEY  │
│     - Bibliothèque: firebase/php-jwt │
│                                       │
│  3. Encodage en JWT                  │
│     - Format: header.payload.sign    │
│     - Exemple: eyJhbGc...            │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Réponse HTTP 200 OK                 │
│  ────────────────────────────────   │
│  {                                   │
│    "token": "eyJhbGciOiJIUzI1NiI...",│
│    "expires_in": 1200                │
│  }                                   │
│                                       │
│  Le client doit stocker ce token     │
│  (localStorage, sessionStorage, etc.)│
│  et l'envoyer dans toutes les        │
│  requêtes protégées.                 │
└──────────────────────────────────────┘
```

---

### 3️⃣ Accès à une ressource protégée (`GET /auth/me`)

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ GET /api/auth/me
       │ Authorization: Bearer eyJhbGciOiJIUzI1NiI...
       │
       ▼
┌──────────────────────────────────────┐
│  Middleware: ForceHttps              │
│  - Vérifie HTTPS                     │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Middleware: JwtAuth                 │
│  ────────────────────────────────   │
│  1. Extraction du token              │
│     - Header: Authorization          │
│     - Format: "Bearer <token>"       │
│     - Si absent → Erreur 401         │
│                                       │
│  2. Décodage du token                │
│     - Appelle JwtService::decodeToken│
│     - Vérifie la signature (HMAC)    │
│     - Vérifie l'expiration (exp)     │
│     - Si invalide → Erreur 401       │
│                                       │
│  3. Extraction du user_id            │
│     - Payload: {"user_id": 42, ...}  │
│                                       │
│  4. Chargement de l'utilisateur      │
│     - UserRepository::findById(42)   │
│     - Si introuvable → Erreur 401    │
│     - Si status != 'active'          │
│       → Erreur 401                   │
│                                       │
│  5. Injection dans la requête        │
│     - $request->attributes->set(     │
│         'auth_user_id', 42)          │
│     - $request->attributes->set(     │
│         'auth_user_role', 'CLIENT')  │
│                                       │
│  6. Continue vers le contrôleur      │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Controller: AuthController          │
│  ────────────────────────────────   │
│  - Méthode: me(Request)              │
│  - Récupère l'ID depuis les attributs│
│    $userId = $request->attributes    │
│              ->get('auth_user_id')   │
│  - Appelle AuthService::me($userId)  │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Service: AuthService                │
│  ────────────────────────────────   │
│  - Appelle UserRepository::findById  │
│  - Retourne les données utilisateur  │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Réponse HTTP 200 OK                 │
│  ────────────────────────────────   │
│  {                                   │
│    "id": 42,                         │
│    "email": "user@example.com",      │
│    "role": "CLIENT",                 │
│    "status": "active"                │
│  }                                   │
└──────────────────────────────────────┘
```

---

### 4️⃣ Accès à une route admin (`GET /admin/users`)

```
┌─────────────┐
│   Client    │
│  (ADMIN)    │
└──────┬──────┘
       │
       │ GET /api/admin/users
       │ Authorization: Bearer eyJhbGciOiJIUzI1NiI...
       │
       ▼
┌──────────────────────────────────────┐
│  Middleware: ForceHttps              │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Middleware: JwtAuth                 │
│  ────────────────────────────────   │
│  - Décode le JWT                     │
│  - Charge l'utilisateur              │
│  - Vérifie que status == 'active'    │
│  - Injecte auth_user_id et           │
│    auth_user_role dans la requête    │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Middleware: RequireRole('ADMIN')    │
│  ────────────────────────────────   │
│  1. Récupère le rôle de la requête   │
│     $role = $request->attributes     │
│             ->get('auth_user_role')  │
│                                       │
│  2. Compare avec le rôle attendu     │
│     - Si $role !== 'ADMIN'           │
│       → Erreur 403 "Forbidden"       │
│                                       │
│  3. Si égal → Continue               │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Controller: AdminUserController     │
│  ────────────────────────────────   │
│  - Méthode: index()                  │
│  - Appelle UserService::listAll()    │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Service: UserService                │
│  - Appelle UserRepository::listAll() │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Repository: UserRepository          │
│  - SELECT id, email, role, status,   │
│      created_at, updated_at          │
│    FROM users                        │
│    ORDER BY id                       │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Réponse HTTP 200 OK                 │
│  ────────────────────────────────   │
│  {                                   │
│    "users": [                        │
│      {                               │
│        "id": 1,                      │
│        "email": "admin@example.com", │
│        "role": "ADMIN",              │
│        "status": "active",           │
│        "created_at": "2026-02-16...", │
│        "updated_at": "2026-02-16..." │
│      },                              │
│      {                               │
│        "id": 42,                     │
│        "email": "user@example.com",  │
│        "role": "CLIENT",             │
│        "status": "active",           │
│        "created_at": "2026-02-21...", │
│        "updated_at": "2026-02-21..." │
│      }                               │
│    ]                                 │
│  }                                   │
└──────────────────────────────────────┘
```

---

### 5️⃣ Tentative d'accès non autorisé

**Scénario** : Un CLIENT essaie d'accéder à une route ADMIN.

```
┌─────────────┐
│   Client    │
│  (CLIENT)   │
└──────┬──────┘
       │
       │ GET /api/admin/users
       │ Authorization: Bearer <token_CLIENT>
       │
       ▼
┌──────────────────────────────────────┐
│  Middleware: ForceHttps              │
│  ✅ HTTPS OK → Continue              │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Middleware: JwtAuth                 │
│  ────────────────────────────────   │
│  ✅ Token valide                     │
│  ✅ Utilisateur actif                │
│  ✅ Injecte:                         │
│     - auth_user_id = 42              │
│     - auth_user_role = "CLIENT"      │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Middleware: RequireRole('ADMIN')    │
│  ────────────────────────────────   │
│  ❌ Rôle actuel: "CLIENT"            │
│  ❌ Rôle requis: "ADMIN"             │
│  ❌ $role !== 'ADMIN'                │
│                                       │
│  → STOP : Retourne 403               │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Réponse HTTP 403 Forbidden          │
│  ────────────────────────────────   │
│  {                                   │
│    "message": "Forbidden."           │
│  }                                   │
│                                       │
│  Le contrôleur n'est jamais atteint. │
└──────────────────────────────────────┘
```

---

### 6️⃣ Expiration du JWT

**Scénario** : Le client utilise un token expiré (> 20 minutes).

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       │ GET /api/auth/me
       │ Authorization: Bearer <token_expiré>
       │
       ▼
┌──────────────────────────────────────┐
│  Middleware: JwtAuth                 │
│  ────────────────────────────────   │
│  1. Extraction du token              │
│     ✅ Header présent                │
│                                       │
│  2. Décodage du token                │
│     - JwtService::decodeToken()      │
│     - Vérifie la signature ✅        │
│     - Vérifie l'expiration:          │
│       exp = 1708532400               │
│       now = 1708533600               │
│       ❌ now > exp                   │
│                                       │
│  3. Token expiré                     │
│     - Firebase JWT lance une         │
│       ExpiredException               │
│     - JwtService retourne null       │
│     - Middleware détecte null        │
│                                       │
│  → STOP : Retourne 401               │
└──────────────┬───────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│  Réponse HTTP 401 Unauthorized       │
│  ────────────────────────────────   │
│  {                                   │
│    "message": "Invalid token."       │
│  }                                   │
│                                       │
│  Le client doit se reconnecter       │
│  avec /auth/login pour obtenir       │
│  un nouveau token.                   │
└──────────────────────────────────────┘
```

---

## Sécurité implémentée

### ✅ Règles respectées

- **HTTPS obligatoire** : Middleware `ForceHttps` sur toutes les routes
- **Pas de secrets en clair** : Tous les mots de passe sont hashés (bcrypt)
- **JWT signé et expiré** : Signature HMAC-SHA256, durée de vie 20 min
- **RBAC strict** : Middleware `RequireRole` vérifie les permissions
- **Validation des mots de passe** :
  - CLIENT : ≥12 caractères + complexité
  - ADMIN : ≥15 caractères + complexité
- **Stateless** : Aucune session serveur, tout est dans le JWT
- **Anti-replay** : Durée de vie courte des JWT (20 min)
- **Logs propres** : Aucun mot de passe, JWT ou secret dans les logs

### 🔐 Points de sécurité avancés

1. **Hashage sécurisé** : Bcrypt avec coût 10 (par défaut Laravel)
2. **Secrets cachés** : `password_hash` et `client_secret_hash` dans `$hidden`
3. **Validation stricte** : Tous les inputs validés avant traitement
4. **Messages d'erreur génériques** : "Invalid credentials" (pas de détails)
5. **Status check** : Les utilisateurs désactivés ne peuvent pas se connecter
6. **Index DB** : Index sur `email` pour performances

---

## Exemples d'utilisation (curl)

### Inscription
```bash
curl -X POST https://localhost/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "MySecurePassword#123"
  }'
```

### Connexion
```bash
curl -X POST https://localhost/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "password": "MySecurePassword#123"
  }'
```

Réponse :
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 1200
}
```

### Profil utilisateur
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl https://localhost/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### Lister les utilisateurs (CLIENT)
```bash
curl https://localhost/api/users \
  -H "Authorization: Bearer $TOKEN"
```

### Créer un utilisateur (ADMIN)
```bash
curl -X POST https://localhost/api/admin/users \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bob@example.com",
    "password": "SecureAdminPass#12345",
    "role": "ADMIN"
  }'
```

### Sauvegarde incrémentale (ADMIN)
```bash
curl -X POST https://localhost/api/admin/backups/incremental \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Historique des sauvegardes (ADMIN)
```bash
curl https://localhost/api/admin/backups/history \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

---

## Configuration et déploiement

### Prérequis système
- PHP 8.2+
- MySQL 8+
- Composer
- `mysqldump`, `mysqlbinlog`, `mysql` dans le PATH
- Binlogs MySQL activés (`log_bin = ON` dans `my.cnf`)

### Installation
```bash
# 1. Installer les dépendances
composer install

# 2. Configurer .env
cp .env.example .env
# Éditer DB_* et JWT_SECRET

# 3. Générer la clé d'application
php artisan key:generate

# 4. Exécuter les migrations
php artisan migrate

# 5. Lancer le serveur (dev)
php artisan serve
```

### Variables d'environnement critiques
```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=moustass
DB_USERNAME=root
DB_PASSWORD=secret

JWT_SECRET=base64:VotreSecretTrèsLongEtSécurisé==
JWT_TTL_MINUTES=20

APP_ENV=production
APP_DEBUG=false
```

### Activation des binlogs MySQL (pour backups incrémentaux)
```sql
-- Dans my.cnf ou my.ini
[mysqld]
log_bin = /var/log/mysql/mysql-bin.log
server-id = 1
```

Redémarrer MySQL après modification.

---

## Tests

### Lancer les tests
```bash
vendor/bin/phpunit
```

### Tests existants
- `tests/Feature/ExampleTest.php` : Vérifie que `/health` retourne 200
- `tests/Unit/ExampleTest.php` : Test unitaire de base

### Tests à ajouter (recommandés)
- Authentification (register, login, JWT)
- Autorisation (rôles, middlewares)
- CRUD utilisateurs
- Sauvegardes/restaurations
- Gestion d'erreurs (401, 403, 422)

---

## Conformité aux règles backend

### ✅ Règles respectées

| Règle | Statut | Implémentation |
|-------|--------|----------------|
| API REST uniquement | ✅ | Routes dans `api.php` |
| Backend stateless | ✅ | JWT, pas de sessions |
| Authentification JWT | ✅ | `JwtService` + `JwtAuth` middleware |
| Autorisation RBAC | ✅ | `RequireRole` middleware |
| HTTPS obligatoire | ✅ | `ForceHttps` middleware global |
| Hashage mots de passe | ✅ | `Hash::make()` (bcrypt) |
| Pas de secrets loggés | ✅ | `$hidden` dans models |
| Validation stricte | ✅ | `Validator` dans services |
| Séparation des couches | ✅ | Controllers → Services → Repos |
| Table `users` conforme | ✅ | Migration avec tous les champs |
| Table `backups_log` | ✅ | Migration avec type, status, notes |
| Sauvegarde complète + incrémentale | ✅ | `BackupService` |
| Restauration full + incréments | ✅ | `restoreLatest()` |
| Journalisation backups | ✅ | `BackupLogRepository` |
| Routes admin protégées | ✅ | Middlewares `jwt` + `role:ADMIN` |
| Endpoint `/health` | ✅ | Health check natif Laravel |

---

## Améliorations futures (hors scope actuel)

- **Refresh tokens** : JWT long terme pour éviter reconnexions fréquentes
- **Preuve de possession** : Client_secret + HMAC comme décrit dans les règles
- **Rate limiting** : Limiter les tentatives de login
- **2FA** : Authentification à deux facteurs
- **Audit logs** : Journaliser toutes les actions admin
- **Webhooks** : Notifier les autres services des changements utilisateurs
- **CI/CD** : GitHub Actions pour tests automatiques
- **Docker** : Conteneurisation pour déploiement facile
- **API Documentation** : Swagger/OpenAPI

---

## Support et contact

Pour toute question sur l'architecture, la sécurité ou l'intégration, consulter les documents de référence :
- `rules_backend_database.md` : Spécifications contractuelles
- `task.md` : Liste des tâches implémentées
- `process.md` : Historique des démarches

**Module développé selon les règles strictes du document `rules_backend_database.md`.**
