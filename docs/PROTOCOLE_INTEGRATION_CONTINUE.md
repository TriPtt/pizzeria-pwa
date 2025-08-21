# Protocole d'Intégration Continue

## Workflow GitHub Actions
- **Trigger :** Push/PR sur main
- **Jobs parallèles :**
  - Backend Tests (Jest)
  - Frontend Build (Vite)

## Séquences d'intégration
1. Checkout code
2. Setup Node.js 20
3. Install dependencies
4. Run tests
5. Build application
6. Security checks
7. Artifacts upload