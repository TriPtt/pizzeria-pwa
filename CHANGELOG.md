# Changelog

## [1.0.0] - 2025-08-16
### Added
- Système d'authentification JWT
- Gestion commandes pizzas
- Paiement Stripe
- Interface PWA
- Tests automatisés

## [1.0.1] - 2025-08-20
### Fixed
- **Scrolling:** Résolution des problèmes de défilement
- **Mes réservations:** Correction du style de la page "Mes réservations"
- **Navbar:** Correction de l'icône du panier dans la barre de navigation
- **Navbar:** Ajustement du style de la barre de navigation
- **Register:** Modification des restrictions d'enregistrements plus poussées
- **Login:** Modification des restrictions de connexion plus poussées

### Changed
- **Navbar:** Modification du style de la barre de navigation
- **Register:** Modification du style de la page
- **Login:** Modification du style de la page

## [1.0.2] - 2025-08-21
### Added
- **Monitoring:** Endpoint `/api/health` pour vérification de l'état du service
- **Monitoring:** Middleware de mesure des performances pour les routes critiques
- **Monitoring:** Script de surveillance automatique `health-monitor`
- **Monitoring:** Vérification automatique de la disponibilité de l'API et de la base de données

### Enhanced
- **Error Handling:** Amélioration de la journalisation des erreurs Stripe
- **Performance:** Ajout du suivi des temps de réponse pour les routes `/api/orders` et `/api/stripe`

## [1.0.3] - 2025-08-21
### Added
- **Database:** Ajout du script pour setup la database à l'aide de la commande npm run setup
- **Account:** Possibilité de supprimer son compte

### Enhanced
- **Accessibility:** Score accéssibilité Lighthouse > 90
- **Graphics:** Amélioration du header des pages go back et de la page mes réservations
- **MarkDown:** Correction du readme et des documentations associés