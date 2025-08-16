# Cahier de Recettes - Pizzeria PWA

## Tests Fonctionnels

### T001 - Authentification
- **Scénario :** Inscription utilisateur
- **Données :** Email valide + mot de passe 8 caractères
- **Résultat attendu :** Compte créé + JWT retourné
- **Statut :** ✅ PASS

### T002 - Commande
- **Scénario :** Création commande pizza
- **Données :** Pizza Margherita + ingrédients
- **Résultat attendu :** Commande sauvée + total calculé
- **Statut :** ✅ PASS

### T003 - Paiement
- **Scénario :** Paiement Stripe
- **Données :** Carte test 4242424242424242
- **Résultat attendu :** Session créée + redirection
- **Statut :** ✅ PASS

## Tests Structurels
- Couverture de code > 80%
- Tests unitaires : 45 tests
- Tests d'intégration : 12 tests

## Tests de Sécurité
- ✅ Authentification JWT
- ✅ Validation des entrées
- ✅ Protection CSRF
- ✅ Audit npm clean