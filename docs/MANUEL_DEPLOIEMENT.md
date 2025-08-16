# Manuel de Déploiement

## Prérequis
- Node.js 20+
- PostgreSQL 14+
- Variables d'environnement configurées

## Déploiement Backend
- Lancer les requêtes SQL du fichier create-tables.sql et seed.sql
```bash
cd back
npm install
npm run start
```

## Déploiement Frontend
```bash
cd front
npm install
npm run start
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