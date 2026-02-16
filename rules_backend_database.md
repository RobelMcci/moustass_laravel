# RULES — BACKEND & BASE DE DONNÉES

> **Document contractuel destiné aux IA, développeurs backend et outils d'assistance**
>
> Objectif : garantir une implémentation **strictement conforme**, **sécurisée** et **intégrable** du module *Moustass Auth*.
>
> ⚠️ Toute implémentation qui viole ces règles est considérée **non conforme**.

---

## 1. PÉRIMÈTRE DU MODULE

Ce module couvre **exclusivement** :
- l'authentification
- l'autorisation (RBAC)
- la gestion des utilisateurs
- la sauvegarde et restauration MySQL
- les API REST associées

Il **ne couvre pas** :
- l’upload audio
- le chiffrement des fichiers audio
- la lecture audio
- la notification client

Le module doit être **autonome**, **stateless**, et **intégrable tel quel**.

---

## 2. PRINCIPES D’ARCHITECTURE BACKEND

### 2.1 Architecture générale

- API REST uniquement
- Backend **stateless**
- Authentification par **JWT**
- Autorisation par **RBAC (Role-Based Access Control)**
- Séparation stricte :
  - controllers
  - services
  - repositories / DAO
  - middlewares

Aucune logique métier complexe dans les controllers.

---

## 3. RÈGLES DE SÉCURITÉ — NON NÉGOCIABLES

### 3.1 Transport

- HTTPS obligatoire
- Aucun endpoint HTTP autorisé
- Aucun fallback vers HTTP

### 3.2 Secrets & données sensibles

- ❌ Ne jamais stocker de mot de passe en clair
- ❌ Ne jamais logger :
  - mot de passe
  - client_secret
  - JWT
  - contenu sensible

- ✅ Hash obligatoire pour :
  - mot de passe (`bcrypt` ou `argon2`)
  - client_secret (si utilisé)

---

## 4. AUTHENTIFICATION

### 4.1 Inscription (`POST /auth/register`)

Règles mot de passe **CLIENT** :
- ≥ 12 caractères
- ≥ 1 majuscule
- ≥ 1 minuscule
- ≥ 1 chiffre
- ≥ 1 caractère spécial

Règles mot de passe **ADMIN** :
- mêmes règles
- ≥ 15 caractères

Traitement serveur :
- validation stricte
- hash du mot de passe
- stockage uniquement du hash

---

### 4.2 Login (`POST /auth/login`)

Le backend doit :
- vérifier email + password
- refuser si `status != active`
- générer un JWT signé
- inclure dans le token :
  - user_id
  - role
  - expiration

Durée de vie JWT :
- courte (ex: 15–30 min)

---

### 4.3 Preuve de possession (OPTION AVANCÉE)

Si implémentée :

À l’inscription :
- générer un `client_secret` aléatoire (32 octets)
- le retourner **une seule fois** au client
- stocker uniquement son hash

Au login :
- le client envoie :
  - timestamp
  - nonce
  - proof = HMAC-SHA256(client_secret, timestamp || nonce)

Le serveur doit :
- recalculer le HMAC
- refuser si timestamp expiré
- refuser si nonce déjà vu (anti-replay)

---

## 5. AUTORISATION (RBAC)

### 5.1 Rôles supportés

- `ADMIN`
- `CLIENT`

### 5.2 Règles globales

- Toutes les routes sensibles exigent :
  - JWT valide
  - rôle approprié

- `/admin/**` → rôle `ADMIN` uniquement

### 5.3 Middleware

Un middleware d’autorisation est **obligatoire**.
Aucune vérification de rôle ne doit être faite manuellement dans les controllers.

---

## 6. API REST — CONTRAT STRICT

### 6.1 Routes publiques

```
POST /auth/register
POST /auth/login
GET  /health
```

`/health` :
- retourne 200 si le service est opérationnel
- aucune authentification requise

---

### 6.2 Routes authentifiées

```
GET /auth/me
GET /users
```

- JWT requis
- `/users` retourne uniquement :
  - utilisateurs actifs
  - champs minimum (id, email)

---

### 6.3 Routes admin

```
GET    /admin/users
POST   /admin/users
PUT    /admin/users/{id}
DELETE /admin/users/{id}

POST /admin/backups/incremental
POST /admin/backups/restore
GET  /admin/backups/history
```

Accès :
- JWT valide
- rôle ADMIN obligatoire

---

## 7. BASE DE DONNÉES — RÈGLES STRICTES

### 7.1 Table `users`

Champs obligatoires :
- id (PK)
- email (unique, non null)
- role (`ADMIN` | `CLIENT`)
- password_hash
- client_secret_hash (nullable)
- status (`active` | `disabled`)
- created_at
- updated_at

Contraintes :
- index sur email
- aucune suppression physique recommandée

---

### 7.2 Table `backups_log`

Champs obligatoires :
- id (PK)
- type (`full` | `incremental`)
- created_at
- file_path
- status (`success` | `failed`)
- notes

Chaque backup ou restore doit écrire une ligne.

---

## 8. SAUVEGARDE & RESTAURATION

### 8.1 Sauvegarde

- Sauvegarde complète initiale obligatoire
- Sauvegardes incrémentales ensuite

Implémentation possible :
- `mysqldump` + binlog
- ou incrément logique contrôlé

---

### 8.2 Restauration

Le mécanisme de restauration doit :
- restaurer la dernière sauvegarde complète
- rejouer les incréments
- remettre la base dans un état cohérent

Une restauration doit être :
- traçable
- journalisée
- démontrable

---

## 9. LOGS & ERREURS

- Logs structurés
- Messages d’erreur clairs mais non sensibles
- Pas de stacktrace exposée au client

---

## 10. QUALITÉ & LIVRABLES

Le backend doit fournir :
- un README technique
- une documentation des routes
- des scripts DB reproductibles
- une démo fonctionnelle

---

## 11. RÈGLE FINALE (IMPÉRATIVE)

> Toute IA, développeur ou outil **doit respecter ces règles à la lettre**.
>
> En cas d’ambiguïté : **la sécurité et la conformité priment toujours**.

