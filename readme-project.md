# Architecture du Projet Moustass Frontend

## Vue d'ensemble

Ce projet est une application React Router (v7.12.0) avec TypeScript, Tailwind CSS v4.1.13 et une architecture séparée entre deux applications : **CLIENT** (utilisateur) et **ADMIN** (gestionnaire). Les deux applications partagent une même base de code avec authentification JWT et gestion des rôles.

---

## Structure du Projet (Arborescence)

```
moustass-front/
├── app/                           # Code source principal de l'application
│   ├── api/                       # Couche API - Clients HTTP pour communiquer avec le backend
│   │   ├── httpClient.ts          # Client HTTP centralisé avec gestion d'erreurs et JWT
│   │   ├── auth.api.ts            # Endpoints d'authentification (login, register, me)
│   │   ├── admin.api.ts           # Endpoints d'administration (users, backups)
│   │   └── users.api.ts           # Endpoints utilisateurs
│   │
│   ├── auth/                      # Gestion de l'authentification
│   │   ├── AuthProvider.tsx       # Context Provider pour JWT et profil utilisateur
│   │   ├── ProtectedRoute.tsx     # Composant pour protéger les routes par rôle
│   │   └── useAuth.ts             # Hook pour accéder au contexte d'authentification
│   │
│   ├── routes/                    # Pages et layouts de l'application
│   │   ├── home.tsx               # Page d'accueil (point d'entrée, choix CLIENT/ADMIN)
│   │   ├── routes.ts              # Définition de toutes les routes
│   │   │
│   │   ├── client/                # Routes côté client (utilisateur)
│   │   │   ├── login.tsx          # Authentification client (Sign In / Sign Up)
│   │   │   ├── layout.tsx         # Layout principal avec navigation
│   │   │   ├── dashboard.tsx      # Tableau de bord / accueil client
│   │   │   ├── inbox.tsx          # Page inbox (placeholder)
│   │   │   └── audio.tsx          # Page audio (placeholder)
│   │   │
│   │   ├── admin/                 # Routes côté admin (gestionnaire)
│   │   │   ├── login.tsx          # Authentification admin (15+ caractères)
│   │   │   ├── layout.tsx         # Layout principal avec navigation
│   │   │   ├── users.tsx          # Gestion des utilisateurs (liste)
│   │   │   ├── user-create.tsx    # Créer un nouvel utilisateur
│   │   │   ├── user-edit.tsx      # Éditer un utilisateur (rôle/statut)
│   │   │   ├── backups.tsx        # Sauvegarde et restauration de données
│   │   │   └── backup-history.tsx # Historique des sauvegardes
│   │   │
│   │   └── welcome/               # Routes de bienvenue (obsolète)
│   │       └── welcome.tsx
│   │
│   ├── shared/                    # Code partagé entre client et admin
│   │   ├── ui/                    # Composants UI réutilisables
│   │   │   ├── Button.tsx         # Bouton (primary, secondary, danger, ghost)
│   │   │   ├── Input.tsx          # Champ de saisie avec validation
│   │   │   ├── Card.tsx           # Conteneur de contenu
│   │   │   ├── Alert.tsx          # Alertes/notifications (info, success, error)
│   │   │   └── Select.tsx         # Sélecteur (dropdown)
│   │   │
│   │   ├── utils/                 # Utilitaires et helpers
│   │   │   └── apiError.ts        # Extraction de messages d'erreur API
│   │   │
│   │   └── validation/            # Validation de formulaires
│   │       ├── passwordRules.ts   # Validation en temps réel des mots de passe
│   │       └── password.ts        # Validateur de mot de passe (deprecated)
│   │
│   ├── root.tsx                   # Root layout de l'application
│   ├── routes.ts                  # Configuration des routes principales
│   └── app.css                    # Configuration Tailwind CSS et styles globaux
│
├── public/                        # Actifs statiques (images, favicon, etc.)
│
├── .react-router/                 # Fichiers générés par React Router
├── node_modules/                  # Dépendances npm
│
├── vite.config.ts                 # Configuration Vite (bundler)
├── react-router.config.ts         # Configuration React Router
├── tsconfig.json                  # Configuration TypeScript
├── tailwind.config.ts             # Configuration Tailwind CSS
├── package.json                   # Dépendances et scripts npm
├── package-lock.json              # Verrous des dépendances
│
├── Dockerfile                      # Configuration Docker pour la production
├── .dockerignore                  # Fichiers ignorés par Docker
│
├── .env.local                      # Variables d'environnement locales
├── .gitignore                      # Fichiers ignorés par Git
├── .git/                           # Repository Git
│
├── README.md                       # Documentation générale du projet
├── rules_frontend.md              # Règles et spécifications du frontend
└── readme-project.md              # Ce fichier (architecture détaillée)
```

---

## Description des Dossiers Principaux

### `/app/api/` - Couche API

Cette couche gère **toute la communication** avec le backend situé à `https://www.moustass.com`.

| Fichier | Responsabilité |
|---------|---|
| **httpClient.ts** | Client HTTP universel avec gestion automatique du JWT, injection du header `Authorization: Bearer token`, gestion des erreurs 401/403/500 et logout automatique |
| **auth.api.ts** | Endpoints: `POST /auth/login`, `POST /auth/register`, `GET /auth/me` |
| **admin.api.ts** | Endpoints: `GET /admin/users`, `POST /admin/users`, `PUT /admin/users/:id`, `DELETE /admin/users/:id`, `POST /admin/backups/incremental`, `POST /admin/backups/restore`, `GET /admin/backups/history` |
| **users.api.ts** | Endpoint: `GET /users` (liste des utilisateurs) |

**Points clés:**
- Base URL fixée à `https://www.moustass.com` (HTTPS obligatoire)
- JWT stocké dans `sessionStorage` uniquement (pas de localStorage)
- Les erreurs sont extraites et rendues génériques (pas de données sensibles exposées)

### `/app/auth/` - Authentification & Autorisation

Gère l'état d'authentification centralisé avec Context API.

| Fichier | Responsabilité |
|---------|---|
| **AuthProvider.tsx** | Context Provider qui gère: JWT (sessionStorage), profil utilisateur (`MeResponse`), fonctions `login()`, `logout()`, `refreshProfile()`. Initialise automatiquement l'authentification au montage de l'app |
| **ProtectedRoute.tsx** | Composant wrapper qui protège les routes: vérifie la présence du token ET le rôle utilisateur, redirige vers `/login` ou `/` en cas d'accès refusé |
| **useAuth.ts** | Hook pour accéder au contexte d'authentification depuis n'importe quel composant |

**Points clés:**
- JWT automatiquement injecté dans tous les appels API via `httpClient.ts`
- Logout automatique sur réponse 401
- Validation du rôle (ADMIN vs CLIENT) après login
- SSR-safe (vérifie `typeof window !== "undefined"` avant d'accéder à sessionStorage)

### `/app/routes/` - Pages & Routage

Contient toutes les pages de l'application organisées par rôle.

#### Structure générale:

```
routes/
├── home.tsx              # Page d'accueil (/ au lancement)
├── routes.ts             # Configuration des routes (route tree)
│
├── client/               # Application CLIENT (Utilisateur)
│   ├── login.tsx         # Connexion/Inscription (12+ chars)
│   ├── layout.tsx        # Navigation principal avec header
│   ├── dashboard.tsx     # Accueil avec infos utilisateur
│   ├── inbox.tsx         # Boîte de réception (vide)
│   └── audio.tsx         # Contenus audio (vide)
│
└── admin/                # Application ADMIN (Gestionnaire)
    ├── login.tsx         # Connexion admin (15+ chars)
    ├── layout.tsx        # Navigation admin avec header
    ├── users.tsx         # Liste des utilisateurs (CRUD)
    ├── user-create.tsx   # Formulaire création utilisateur
    ├── user-edit.tsx     # Éditer rôle/statut utilisateur
    ├── backups.tsx       # Interface sauvegarde/restauration
    └── backup-history.tsx # Historique des sauvegardes
```

**Points clés par application:**

**CLIENT:**
- Authentification: 12+ caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial
- Thème: Bleu/Indigo sombre avec fond gradient
- Routes protégées: `/client/*` (requires CLIENT ou ADMIN)

**ADMIN:**
- Authentification: 15+ caractères (+ critères du CLIENT)
- Thème: Orange/Amber sombre avec warnings de sécurité
- Routes protégées: `/admin/*` (requires ADMIN only)
- Fonctionnalités: Gestion complète des utilisateurs et sauvegardes

### `/app/shared/` - Code Réutilisable

Code partagé entre l'application CLIENT et ADMIN.

#### `/app/shared/ui/` - Composants UI

Tous les composants UI sont sans opinions de style fortement liées au contexte. Ils hériterment des couleurs Tailwind appliquées via les classes parentes.

| Composant | Utilisation |
|-----------|---|
| **Button.tsx** | Boutons réutilisables avec 4 variantes: `primary` (bleu), `secondary` (gris), `danger` (rouge), `ghost` (transparent) |
| **Input.tsx** | Champs de saisie avec labels, support d'erreurs, show/hide pour passwords |
| **Card.tsx** | Conteneur avec titre optionnel et actions, borders/shadows, hover effects |
| **Alert.tsx** | Notifications avec 3 types: `info` (bleu), `success` (vert), `error` (rouge) avec icônes SVG |
| **Select.tsx** | Dropdowns compatibles avec tous les styles |

#### `/app/shared/utils/` - Helpers

| Fichier | Responsabilité |
|---------|---|
| **apiError.ts** | `getErrorMessage(error)` - Extrait un message d'erreur générique depuis les réponses API sans exposer de détails sensibles |

#### `/app/shared/validation/` - Validation

| Fichier | Responsabilité |
|---------|---|
| **passwordRules.ts** | `getPasswordRules(password, minLength)` - Retourne un tableau d'objets `PasswordRule` avec validation en temps réel et feedback visuel (✓/✗) |
| **password.ts** | Ancien validateur (deprecated) - Préférer `passwordRules.ts` |

### `/app/root.tsx` - Root Layout

Enveloppe principale de l'application:
- Fournit le `<AuthProvider>` (context d'authentification)
- Configure SSR (isbot pour les crawlers)
- Applique les classes Tailwind au niveau racine

### `/app/app.css` - Styles Globaux

- Import des polices Inter
- Configuration des variables CSS (si utilisées)
- Directives Tailwind (`@layer`, `@apply`)

---

## Flux d'Authentification

```
1. Utilisateur arrive sur /
   ↓
2. Home page: choix entre CLIENT login ou ADMIN login
   ↓
3. Selon le choix:
   - CLIENT: POST /auth/login (12+ chars) → GET /auth/me → redirect /client
   - ADMIN: POST /auth/login (15+ chars) → GET /auth/me → redirect /admin
   ↓
4. AuthProvider stocke JWT en sessionStorage
   ↓
5. ProtectedRoute vérifie:
   - JWT existe?
   - Rôle autorisé (ADMIN ou CLIENT)?
   ↓
6. Accès accordé → Page affichée
   Accès refusé → Redirect login ou home
```

---

## Arborescence Complète des Routes

### Routes CLIENT `:9` pages)

```
GET  /                          → home.tsx (choix CLIENT/ADMIN)
GET  /client/login              → client/login.tsx (Sign In / Sign Up)
GET  /client/                   → client/dashboard.tsx (Accueil)
GET  /client/inbox              → client/inbox.tsx (Placeholder)
GET  /client/audio              → client/audio.tsx (Placeholder)
```

### Routes ADMIN (8 pages)

```
GET  /admin/login               → admin/login.tsx (Connexion)
GET  /admin/                    → admin/users.tsx (Liste utilisateurs)
GET  /admin/users               → admin/users.tsx (Liste utilisateurs)
GET  /admin/users/create        → admin/user-create.tsx (Créer)
GET  /admin/users/:id/edit      → admin/user-edit.tsx (Éditer)
GET  /admin/backups             → admin/backups.tsx (Sauvegarde/Restauration)
GET  /admin/backups/history     → admin/backup-history.tsx (Historique)
```

---

## Configuration des Fichiers Clés

### `package.json` - Scripts npm

```json
{
  "scripts": {
    "dev": "react-router dev",          # Démarre le serveur de développement (http://localhost:5173)
    "build": "react-router build",      # Build pour la production
    "start": "react-router-serve ./build/server/index.js",  # Lance le serveur production
    "typecheck": "react-router typegen && tsc"              # Vérification TypeScript
  }
}
```

### `react-router.config.ts` - Routes & Configuration

Définit:
- Les entrées de routage (layouts, pages)
- La configuration du serveur
- Les asset handlers

### `vite.config.ts` - Bundler

Configure:
- Vite comme bundler
- Plugin React Router
- Path aliases (`@/`)

### `tsconfig.json` - TypeScript

- Target ES2020
- Module ESNext
- Path mapping pour imports cleans

### `tailwind.config.ts` - Styles

- Extending Tailwind default theme
- Dark mode support via `dark:` prefix
- Couleurs personnalisées (bleu/indigo pour CLIENT, orange/amber pour ADMIN)

---

## Types de Données Clés

### JWT & Authentification

```typescript
// Response from /auth/login
interface LoginResponse {
  token: string;        // JWT stocker en sessionStorage
  user: MeResponse;
}

// Response from /auth/me
interface MeResponse {
  id: string;
  email: string;
  role: "CLIENT" | "ADMIN";
  status?: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt?: string;
}
```

### Utilisateurs

```typescript
interface User {
  id: string;
  email: string;
  role: "CLIENT" | "ADMIN";
  status: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  createdAt: string;
}
```

### Sauvegardes

```typescript
interface Backup {
  id: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  date: string;
}
```

### Validation Passwords

```typescript
interface PasswordRule {
  label: string;
  met: boolean;
  test: (password: string) => boolean;
}
```

---

## Thèmes & Design

### CLIENT (Bleu/Indigo)

- **Login**: Gradient indigo-950 → gray-900, badge bleu/indigo
- **Header**: Sombre semi-transparent
- **Accents**: Bleu pour navigation active, boutons, badges rôle
- **Cards**: Borders gris-700, background gris-900/60

### ADMIN (Orange/Amber)

- **Login**: Gradient amber-950 → gray-950, badge amber
- **Header**: Sombre avec icônes, badge rôle ADMIN visible
- **Accents**: Amber pour navigation active, warnings, badges
- **Cards**: Borders gris-700, background gris-900/60
- **Warnings**: Pour actions sensibles (backup restore, delete)

### Composants Partagés

- **Alert**: Info (bleu), Success (vert), Error (rouge)
- **Button**: Primary (gradient), Secondary (gris), Danger (rouge), Ghost (transparent)
- **Badge**: Couleurs par rôle/statut
- **PasswordRuleItem**: ✓ vert, ✗ gris

---

## Flow de Développement

### Installation et Démarre

```bash
npm install         # Installer les dépendances
npm run dev        # Démarrer le serveur (http://localhost:5173)
npm run typecheck  # Vérifier les types TypeScript
npm run build      # Builder pour production
npm start          # Lancer le serveur production
```

### Ajouter une Nouvelle Page

1. Créer `app/routes/[role]/[pagename].tsx`
2. Importer et exporter dans `app/routes.ts`
3. Ajouter la `ProtectedRoute` si nécessaire

### Ajouter un Endpoint API

1. Créer une fonction dans `app/api/[domain].api.ts`
2. Utiliser `httpClient.request<ResponseType>()`
3. Gérer les erreurs avec `getErrorMessage()`

### Ajouter un Composant UI

1. Créer `app/shared/ui/[Component].tsx`
2. Exporter le composant
3. Réutiliser partout dans l'app

---

## Considérations de Sécurité

✅ **Implémenté:**
- JWT en sessionStorage uniquement (pas localStorage)
- HTTPS au backend (`https://www.moustass.com`)
- Logout automatique sur 401
- Messages d'erreur génériques (pas de données sensibles)
- Validation de rôle côté frontend (+ backend)
- Pas de logs de JWT/password en console

⚠️ **À tester avec le backend:**
- Expiration du JWT
- Refresh token flow (si applicable)
- CORS policies
- Rate limiting sur login

---

## Próximas Etapes / TODOs

- [ ] Backend integration testing
- [ ] Fonctionnalités Client inbox/audio
- [ ] Toggle dark mode (CSS support exists)
- [ ] Admin audit logs / Password reset
- [ ] E2E tests (Playwright/Cypress)
- [ ] Performance optimization (code splitting)
- [ ] Accessibility audit (WCAG)

---

**Dernière mise à jour**: 21 février 2026
