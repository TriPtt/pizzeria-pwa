# Protocole de Déploiement Continu - Pizzeria PWA

## Environnements de développement
- **Éditeur :** VS Code avec extensions Vue.js, ESLint
- **Compilateur Frontend :** Vite.js
- **Runtime Backend :** Node.js 20
- **Serveur de développement :** Vite dev server (frontend) + Nodemon (backend)
- **Outils de gestion de sources :** Git + GitHub

## Séquences de déploiement
- **Merge/push sur main** → Build + Tests + Déploiement staging

## Critères de qualité et performance
- Tests unitaires > 80% de couverture
- Temps de chargement < 3s
- Lighthouse Score > 90