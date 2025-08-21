# Manuel de Déploiement

## Lien vers le projet déployé
[LA FAVOLA](https://pizzeria-pwa-rho.vercel.app/)

## Prérequis
- Node.js 20+
- PostgreSQL 14+
- Variables d'environnement configurées

## 1. Cloner le projet
```bash
git clone https://github.com/TriPtt/pizzeria-pwa.git
cd pizzeria-pwa
```

## 2. Installation Backend
```bash
cd back
npm install

# Configuration des variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs (détails dans le fichier)

#Initialise automatiquement la DB
npm run setup
```

## 3. Installation Frontend
```bash
cd front
npm install

# Configuration des variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs (détails dans le fichier)
```

## Variables d'environnement
```bash
DATABASE_URL=postgresql://
JWT_SECRET=...
STRIPE_SECRET_KEY=...
VITE_STRIPE_PUBLIC_KEY=...
VITE_API_URL_BACK=url_du_back
VITE_API_URL=ulr_du_front
```