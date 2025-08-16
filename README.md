# 🍕 Pizzeria PWA - LA FAVOLA

> **Application Progressive Web App (PWA) pour la modernisation des services d'une pizzeria**  
> Projet réalisé dans le cadre de la certification RNCP39583 - Expert en Développement Logiciel

[![CI/CD Pipeline](https://github.com/TriPtt/pizzeria-pwa/actions/workflows/ci.yml/badge.svg)](https://github.com/TriPtt/pizzeria-pwa/actions)
[![Coverage](https://img.shields.io/badge/coverage-85%25-brightgreen)](./back/coverage)
[![Security](https://img.shields.io/badge/security-OWASP-blue)](./docs/SECURITE_OWASP.md)
[![Accessibility](https://img.shields.io/badge/accessibility-RGAA%204.1-green)](./docs/ACCESSIBILITE.md)

## 📋 Table des matières

- [À propos du projet](#-à-propos-du-projet)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture technique](#-architecture-technique)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Tests](#-tests)
- [Déploiement](#-déploiement)
- [Documentation](#-documentation)
- [Contribution](#-contribution)
- [Licence](#-licence)

## 🎯 À propos du projet

Cette application PWA modernise les services d'une pizzeria traditionnelle en offrant :
- **Commande en ligne** avec personnalisation des pizzas
- **Système de réservation** pour les tables
- **Paiements sécurisés** via Stripe
- **Interface responsive** adaptée mobile et desktop
- **Mode hors-ligne** grâce aux Service Workers

### 🏆 Compétences validées (BLOC 02)

- ✅ **C2.1.1** - Environnements de déploiement et test
- ✅ **C2.1.2** - Système d'intégration continue
- ✅ **C2.2.1** - Prototype d'application logicielle
- ✅ **C2.2.2** - Harnais de tests unitaires
- ✅ **C2.2.3** - Développement sécurisé et accessible
- ✅ **C2.2.4** - Déploiement progressif
- ✅ **C2.3.1** - Cahier de recettes
- ✅ **C2.3.2** - Plan de correction des bogues
- ✅ **C2.4.1** - Documentation technique

## ✨ Fonctionnalités

### 👥 Utilisateurs
- 🔐 **Authentification** : Inscription, connexion, gestion de profil
- 🍕 **Catalogue produits** : Navigation, filtres, détails
- 🛒 **Commandes** : Panier, personnalisation, historique
- 💳 **Paiements** : Intégration Stripe sécurisée
- 📱 **PWA** : Installation, notifications push, mode hors-ligne
- ⭐ **Avis clients** : Notation et commentaires

### 👨‍💼 Administration
- 📊 **Dashboard** : Statistiques temps réel
- 🍕 **Gestion produits** : CRUD complet
- 📋 **Gestion commandes** : Suivi statuts
- 🏠 **Réservations** : Planning des tables
- 👥 **Gestion utilisateurs** : Rôles et permissions

## 🏗️ Architecture technique

### Stack technologique
```
Frontend (PWA)     Backend (API)      Base de données
┌─────────────┐   ┌──────────────┐   ┌──────────────┐
│   Vue.js 3  │   │   Node.js    │   │ PostgreSQL   │
│   Pinia     │◄─►│   Express    │◄─►│   Tables     │
│   Vite      │   │   JWT Auth   │   │   Relations  │
│ Service     │   │   Stripe     │   │   Indexes    │
│ Workers     │   │   bcrypt     │   │              │
└─────────────┘   └──────────────┘   └──────────────┘
```

### 📁 Structure du projet
```
pizzeria-pwa/
├── 📁 front/                  # Application Vue.js PWA
│   ├── 📁 src/
│   │   ├── 📁 components/     # Composants réutilisables
│   │   ├── 📁 views/          # Pages de l'application
│   │   ├── 📁 stores/         # Gestion d'état Pinia
│   │   ├── 📁 composables/    # Logique réutilisable
│   │   └── 📄 main.js         # Point d'entrée
│   ├── 📄 package.json
│   └── 📄 vite.config.js      # Configuration Vite
├── 📁 back/                   # API REST Node.js
│   ├── 📁 src/
│   │   ├── 📁 controllers/    # Logique métier
│   │   ├── 📁 middlewares/    # Authentification, CORS
│   │   ├── 📁 utils/          # Utilitaires (hash, JWT)
│   │   └── 📄 app.js          # Configuration Express
│   ├── 📁 tests/              # Tests unitaires Jest
│   └── 📄 package.json
├── 📁 docs/                   # Documentation technique
│   ├── 📄 PROTOCOLE_DEPLOIEMENT_CONTINU.md
│   ├── 📄 PROTOCOLE_INTEGRATION_CONTINUE.md
│   ├── 📄 ARCHITECTURE_LOGICIELLE.md
│   ├── 📄 SECURITE_OWASP.md
│   ├── 📄 ACCESSIBILITE.md
│   ├── 📄 CAHIER_RECETTES.md
│   ├── 📄 PLAN_CORRECTION_BOGUES.md
│   ├── 📄 MANUEL_DEPLOIEMENT.md
│   ├── 📄 MANUEL_UTILISATION.md
│   └── 📄 MANUEL_MISE_A_JOUR.md
├── 📁 .github/workflows/      # CI/CD GitHub Actions
└── 📄 README.md               # Ce fichier
```

## 🚀 Installation

### Prérequis
- **Node.js** v20+ et npm
- **PostgreSQL** v14+
- **Git** pour le clonage

### 1. Cloner le projet
```bash
git clone https://github.com/TriPtt/pizzeria-pwa.git
cd pizzeria-pwa
```

### 2. Configuration de la base de données
```bash
# Créer la base de données PostgreSQL
createdb pizzeria_db

# Importer le schéma (si disponible)
psql -d pizzeria_db -f database/schema.sql
```

### 3. Installation Backend
```bash
cd back
npm install

# Configuration des variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs :
# DATABASE_URL=postgresql://user:password@localhost:5432/pizzeria_db
# JWT_SECRET=your_jwt_secret_key
# STRIPE_SECRET_KEY=sk_test_...
```

### 4. Installation Frontend
```bash
cd ../front
npm install

# Configuration des variables d'environnement
cp .env.example .env
# Éditer .env avec l'URL de votre API
# VITE_API_URL=http://localhost:5000
```

## 💻 Utilisation

### Développement local

#### Démarrer le backend
```bash
cd back
npm run dev  # Lance nodemon sur le port 5000
```

#### Démarrer le frontend
```bash
cd front
npm run dev  # Lance Vite dev server sur le port 3000
```

#### Accès à l'application
- **Frontend** : http://localhost:3000
- **API Backend** : http://localhost:5000

### Comptes de test
- **Admin** : admin@lafavola.com / admin123
- **Client** : client@test.com / client123

## 🧪 Tests

### Tests Backend (Jest)
```bash
cd back
npm test                    # Exécuter tous les tests
npm run test:watch         # Mode watch
npm run test:coverage      # Rapport de couverture
```

**Couverture actuelle :** 85% (branches: 70%, fonctions: 80%, lignes: 80%)

### Tests Frontend (Vitest)
```bash
cd front
npm test                    # Tests unitaires
npm run test:ui            # Interface graphique
npm run test:coverage      # Couverture
```

### Tests d'intégration
Les tests E2E sont exécutés automatiquement dans la CI/CD via GitHub Actions.

## 🚀 Déploiement

### Automatique (GitHub Actions)
Le déploiement se déclenche automatiquement sur :
- **Push sur `main`** → Déploiement production
- **Push sur `develop`** → Déploiement staging

### Manuel
```bash
# Backend
cd back
npm run start

# Frontend (build de production)
cd front
npm run build
# Les fichiers sont générés dans front/dist/
```

### Variables d'environnement de production
```env
NODE_ENV=production
DATABASE_URL=postgresql://...
JWT_SECRET=secure_random_key
STRIPE_SECRET_KEY=sk_live_...
```

## 📚 Documentation

### Documentation technique complète
- 📋 [Protocole de déploiement continu](./docs/PROTOCOLE_DEPLOIEMENT_CONTINU.md)
- 🔄 [Protocole d'intégration continue](./docs/PROTOCOLE_INTEGRATION_CONTINUE.md)
- 🏗️ [Architecture logicielle](./docs/ARCHITECTURE_LOGICIELLE.md)
- 🔒 [Mesures de sécurité OWASP](./docs/SECURITE_OWASP.md)
- ♿ [Accessibilité RGAA](./docs/ACCESSIBILITE.md)
- ✅ [Cahier de recettes](./docs/CAHIER_RECETTES.md)
- 🐛 [Plan de correction des bogues](./docs/PLAN_CORRECTION_BOGUES.md)

### Manuels d'utilisation
- 🚀 [Manuel de déploiement](./docs/MANUEL_DEPLOIEMENT.md)
- 👥 [Manuel d'utilisation](./docs/MANUEL_UTILISATION.md)
- 🔄 [Manuel de mise à jour](./docs/MANUEL_MISE_A_JOUR.md)

## 🔧 Technologies utilisées

### Frontend
- **Vue.js 3** - Framework progressif
- **Composition API** - Logique composable
- **Pinia** - Gestion d'état moderne
- **Vue Router** - Routage SPA
- **Vite** - Build tool rapide
- **PWA** - Service Workers, Web App Manifest
- **Axios** - Client HTTP
- **Stripe.js** - Paiements
- **Heroicons** - Icônes

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web minimaliste
- **PostgreSQL** - Base de données relationnelle
- **JWT** - Authentification stateless
- **bcrypt** - Hash des mots de passe
- **Stripe** - API de paiement
- **CORS** - Cross-Origin Resource Sharing

### DevOps & Qualité
- **GitHub Actions** - CI/CD
- **Jest** - Tests unitaires backend
- **Vitest** - Tests unitaires frontend
- **ESLint** - Linting JavaScript
- **npm audit** - Audit de sécurité

## 📊 Métriques de qualité

- ✅ **Tests** : 85% de couverture
- ✅ **Sécurité** : OWASP Top 10 couvert
- ✅ **Accessibilité** : RGAA 4.1 niveau AA
- ✅ **Performance** : Lighthouse Score > 90
- ✅ **PWA** : Progressive Web App optimisée

## 🤝 Contribution

Ce projet a été réalisé dans le cadre de la certification **RNCP39583 - Expert en Développement Logiciel**.

### Standards de développement
- **Code style** : ESLint + Prettier
- **Commits** : Conventional Commits
- **Branches** : GitFlow (main/develop/feature/*)
- **Tests** : Couverture minimale 80%

## 📞 Contact

**Tristan Petit**  
📧 Email : tristan.petit@ynov.com  
🎓 Certification : RNCP39583 - Expert en Développement Logiciel  
🏫 École : YNOV Campus

## 📄 Licence

Ce projet est réalisé à des fins pédagogiques dans le cadre de la certification RNCP39583.

---

## 🏷️ Versions

| Version | Date | Description |
|---------|------|-------------|
| 1.0.0 | 2024-12 | Version initiale avec toutes les fonctionnalités |

---

**🍕 Bon appétit avec LA FAVOLA ! 🇮🇹**