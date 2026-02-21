# Moustass Frontend

Frontend React pour Moustass Auth - Interface Client & Admin strictement alignée avec le backend.

## 🎯 Objectif

Ce projet implémente le frontend du système d'authentification Moustass, conformément aux règles définies dans [rules_frontend.md](./rules_frontend.md).

## ✨ Fonctionnalités

### Espace Client
- ✅ Authentification (Sign In / Sign Up)
- ✅ Validation en temps réel du mot de passe
- ✅ Dashboard utilisateur
- ✅ Inbox (préparé pour intégration future)
- ✅ Audio (préparé pour intégration future)

### Espace Admin
- ✅ Authentification admin
- ✅ Gestion des utilisateurs (CRUD)
- ✅ Backups & restauration
- ✅ Historique des backups

## 🔒 Sécurité

- JWT géré via sessionStorage
- Appels API vers `https://www.moustass.com` uniquement
- Validation UX sans fuite d'informations sensibles
- Protection des routes par rôle (CLIENT / ADMIN)

### Règles de mot de passe CLIENT

- ≥ 12 caractères
- ≥ 1 majuscule
- ≥ 1 minuscule
- ≥ 1 chiffre
- ≥ 1 caractère spécial

### Règles de mot de passe ADMIN

- ≥ 15 caractères (+ mêmes critères que CLIENT)

## 🚀 Développement

### Installation

```bash
npm install
```

### Démarrage

```bash
npm run dev
```

Application disponible sur `http://localhost:5173`

## 📦 Build en production

```bash
npm run build
```

## 🐳 Déploiement Docker

To build and run using Docker:

```bash
docker build -t my-app .

# Run the container
docker run -p 3000:3000 my-app
```

The containerized application can be deployed to any platform that supports Docker, including:

- AWS ECS
- Google Cloud Run
- Azure Container Apps
- Digital Ocean App Platform
- Fly.io
- Railway

### DIY Deployment

If you're familiar with deploying Node applications, the built-in app server is production-ready.

Make sure to deploy the output of `npm run build`

```
├── package.json
├── package-lock.json (or pnpm-lock.yaml, or bun.lockb)
├── build/
│   ├── client/    # Static assets
│   └── server/    # Server-side code
```

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever CSS framework you prefer.

---

Built with ❤️ using React Router.
