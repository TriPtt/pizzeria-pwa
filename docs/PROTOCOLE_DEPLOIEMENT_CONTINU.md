# Protocole de Déploiement Continu - Pizzeria PWA

## Environnements de développement
- **Éditeur :** VS Code avec extensions Vue.js, ESLint
- **Compilateur Frontend :** Vite.js
- **Runtime Backend :** Node.js 20
- **Serveur de développement :** Vite dev server (frontend) + Nodemon (backend)
- **Outils de gestion de sources :** Git + GitHub

## Séquences de déploiement
1. **Push sur branche develop** → Tests automatiques
2. **Merge sur main** → Build + Tests + Déploiement staging
3. **Tag release** → Déploiement production

## Critères de qualité et performance
- Tests unitaires > 80% de couverture
- Temps de chargement < 3s
- Lighthouse Score > 90
- Sécurité : npm audit clean