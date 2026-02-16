# RULES — FRONTEND (CLIENT & ADMIN)

> **Document contractuel destiné aux IA, développeurs frontend et outils d’assistance**
>
> Objectif : garantir une implémentation frontend **sécurisée**, **prévisible**, **intégrable** et **parfaitement alignée avec le backend Moustass Auth**.
>
> ⚠️ Toute implémentation frontend qui viole ces règles est considérée **non conforme**.

---

## 1. PÉRIMÈTRE FRONTEND

Le frontend couvre **uniquement** :
- l’interface utilisateur
- la gestion des sessions côté navigateur
- la consommation des API REST backend
- la séparation Client / Admin

Le frontend **ne fait jamais** :
- de logique de sécurité métier
- de validation de confiance (toujours côté backend)
- de stockage de secrets sensibles

Le frontend est **un consommateur strict** du backend.

---

## 2. TECHNOLOGIES IMPOSÉES

- Framework : **React**
- Communication : **API REST HTTPS uniquement**
- Authentification : **JWT fourni par le backend**

Aucune autre technologie ne doit contourner ces principes.

---

## 3. ARCHITECTURE FRONTEND

### 3.1 Séparation fonctionnelle

Le frontend doit être découpé en **deux applications logiques** :

- **Client App**
- **Admin App**

Elles peuvent partager :
- des composants UI
- un client HTTP commun
- des hooks utilitaires

---

### 3.2 Organisation recommandée

```
frontend/
├── api/
│   ├── httpClient.js
│   ├── auth.api.js
│   ├── admin.api.js
│   └── users.api.js
├── auth/
│   ├── AuthProvider.jsx
│   ├── useAuth.js
│   └── ProtectedRoute.jsx
├── client/
│   ├── pages/
│   └── components/
├── admin/
│   ├── pages/
│   └── components/
├── shared/
│   └── ui/
└── router/
```

---

## 4. COMMUNICATION AVEC LE BACKEND (OBLIGATOIRE)

### 4.1 Base URL

- Toutes les requêtes doivent cibler :

```
https://www.moustass.com
```

- ❌ Aucun appel vers `localhost`
- ❌ Aucun appel HTTP

---

### 4.2 Routes backend à consommer

Le frontend doit se préparer à consommer **strictement** les routes suivantes :

#### Authentification
```
POST /auth/register
POST /auth/login
GET  /auth/me
```

#### Intégration utilisateurs
```
GET /users
```

#### Administration
```
GET    /admin/users
POST   /admin/users
PUT    /admin/users/{id}
DELETE /admin/users/{id}

POST /admin/backups/incremental
POST /admin/backups/restore
GET  /admin/backups/history
```

---

## 5. GESTION DE L’AUTHENTIFICATION FRONTEND

### 5.1 JWT

- Le JWT est :
  - fourni par `/auth/login`
  - stocké **temporairement** côté frontend

Stockage autorisé :
- mémoire (state React)
- éventuellement `sessionStorage`

Stockage interdit :
- `localStorage` (éviter persistance longue)

---

### 5.2 Cycle de session

- Login → récupération JWT
- Appels API → JWT dans header `Authorization: Bearer <token>`
- Expiration JWT → logout automatique

Le frontend ne tente **jamais** de rafraîchir un token sans endpoint dédié.

---

### 5.3 Récupération du profil

Au chargement de l’application :
- appel obligatoire à :

```
GET /auth/me
```

- pour :
  - vérifier validité du token
  - connaître le rôle utilisateur

---

## 6. AUTORISATION & ROUTING

### 6.1 Règles de navigation

- Routes **Admin** accessibles uniquement si `role === ADMIN`
- Routes **Client** accessibles si `role === CLIENT` ou `ADMIN`

---

### 6.2 Protected Routes

- Toute route sensible doit être protégée par :
  - vérification token
  - vérification rôle

La protection se fait via un composant `ProtectedRoute`.

---

## 7. INTERFACE CLIENT — RÈGLES

### 7.1 Écrans minimum

- Login client
- Accès futur inbox / audio (hors périmètre métier)

### 7.2 Règles UX

- Validation visuelle des champs
- Messages d’erreur génériques
- Aucune information sensible affichée

---

## 8. INTERFACE ADMIN — RÈGLES

### 8.1 Écrans obligatoires

- Login admin
- Liste utilisateurs
- Création utilisateur
- Modification rôle / statut
- Suppression utilisateur
- Backup / restore
- Historique backups

---

### 8.2 Règles admin

- Toute action critique nécessite :
  - confirmation utilisateur
  - feedback clair (succès / échec)

- Les erreurs backend doivent être :
  - interprétées
  - affichées sans fuite d’information

---

## 9. VALIDATION CÔTÉ FRONTEND

### 9.1 Mot de passe

Le frontend applique une validation UX **identique** au backend :

CLIENT :
- ≥ 12 caractères
- ≥ 1 majuscule
- ≥ 1 minuscule
- ≥ 1 chiffre
- ≥ 1 caractère spécial

ADMIN :
- mêmes règles
- ≥ 15 caractères

⚠️ Cette validation est **UX uniquement**.
Le backend reste la seule source de vérité.

---

## 10. GESTION DES ERREURS

Le frontend doit gérer explicitement :
- 401 → logout
- 403 → accès refusé
- 500 → erreur serveur générique

Aucune stacktrace affichée.

---

## 11. LOGS & DEBUG

- ❌ Aucun log contenant :
  - JWT
  - mot de passe
  - secret

- Logs frontend réservés au debug local uniquement

---

## 12. QUALITÉ & LIVRABLES FRONTEND

Le frontend doit fournir :
- une arborescence claire
- des composants lisibles
- une gestion d’état maîtrisée
- une documentation minimale

---

## 13. RÈGLE FINALE (IMPÉRATIVE)

> Le frontend **ne décide jamais de la sécurité**.
>
> Il applique strictement les règles du backend et consomme ses routes telles quelles.
>
> En cas de doute : **le backend fait foi**.

