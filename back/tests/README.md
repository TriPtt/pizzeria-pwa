# Tests Backend Pizzeria PWA

Ce dossier contient la suite de tests complète pour l'API backend de l'application Pizzeria PWA.

## Structure des Tests

```
tests/
├── setup.js                    # Configuration globale Jest
├── controllers/                # Tests des contrôleurs
│   ├── authController.test.js
│   ├── orderController.test.js
│   ├── productController.test.js
│   ├── reservationController.test.js
│   ├── stripeController.test.js
│   └── wishlistController.test.js
├── middlewares/
│   └── middleware.test.js      # Tests des middlewares
└── utils/
    └── utils.test.js           # Tests des utilitaires

```

## Installation et Configuration

### 1. Installer les dépendances de test

```bash
npm install --save-dev jest supertest @babel/core @babel/preset-env
```

### 2. Scripts disponibles

```bash
# Lancer tous les tests
npm test

# Lancer les tests en mode watch (redémarre automatiquement)
npm run test:watch

# Générer le rapport de couverture
npm run test:coverage
```

## Couverture des Tests

Les tests couvrent les aspects suivants :

### Contrôleurs (Controllers)
- ✅ **AuthController** : Inscription, connexion, authentification
- ✅ **ProductController** : CRUD produits, ingrédients, types
- ✅ **OrderController** : Création commandes, validation, historique
- ✅ **WishlistController** : Gestion liste de souhaits
- ✅ **StripeController** : Sessions de paiement
- ✅ **ReservationController** : Gestion des réservations

### Middlewares
- ✅ **authMiddleware** : Vérification JWT
- ✅ **authorizeRole** : Autorisation par rôles

### Utilitaires (Utils)
- ✅ **Hash** : Hashage et comparaison de mots de passe
- ✅ **JWT** : Génération et vérification de tokens

## Mocks et Configuration

### Base de données
Les tests utilisent des mocks de PostgreSQL via `global.mockPool` :
- Pas de connexion réelle à la DB
- Contrôle total des réponses
- Isolation des tests

### Services externes
- **Stripe** : Mock complet de l'API
- **bcrypt** : Mock pour le hashage
- **jsonwebtoken** : Mock pour les JWT

### Variables d'environnement
Configuration automatique dans `setup.js` :
```javascript
process.env.JWT_SECRET = 'test_secret_key';
process.env.STRIPE_SECRET_KEY = 'sk_test_123';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
```

## Exemples de Tests

### Test d'un endpoint
```javascript
test('should create product successfully', async () => {
  const newProduct = {
    name: 'Pizza Test',
    price: 15.00,
    type: 'pizza'
  };

  global.mockPool.query.mockResolvedValue({ 
    rows: [{ id: 1, ...newProduct }] 
  });

  const response = await request(app)
    .post('/api/products')
    .send(newProduct);

  expect(response.status).toBe(201);
  expect(response.body.product.name).toBe('Pizza Test');
});
```

### Test d'un middleware
```javascript
test('should authenticate user with valid token', () => {
  req.headers.authorization = 'Bearer valid_token';
  jwt.verify.mockReturnValue({ id: 1, role: 'client' });

  authMiddleware(req, res, next);

  expect(req.user.id).toBe(1);
  expect(next).toHaveBeenCalled();
});
```

## Objectifs de Couverture

- **Branches** : 70%
- **Fonctions** : 80%
- **Lignes** : 80%
- **Statements** : 80%

## Bonnes Pratiques

### Structure des tests
1. **Arrange** : Préparation des données
2. **Act** : Exécution de l'action
3. **Assert** : Vérification des résultats

### Nommage
- Tests descriptifs : `should return 400 if required fields are missing`
- Groupement logique avec `describe()`
- Un test = un scénario

### Isolation
- `beforeEach()` pour nettoyer les mocks
- Pas de dépendances entre tests
- Données de test indépendantes

## Commandes Utiles

```bash
# Tests avec affichage détaillé
npm test -- --verbose

# Tests d'un fichier spécifique
npm test -- auth

# Tests en mode watch avec pattern
npm test -- --watch --testNamePattern="should create"

# Rapport de couverture en format HTML
npm run test:coverage
# Ouvre coverage/lcov-report/index.html
```

## Dépannage

### Problèmes courants

1. **Tests qui traînent** : Vérifier les mocks async
2. **Fuites mémoire** : Nettoyer les timers et mocks
3. **Modules ES6** : Utiliser la config Babel

### Debug
```bash
# Lancer un test spécifique en debug
node --inspect-brk node_modules/.bin/jest --runInBand tests/controllers/authController.test.js
```

## Ajout de Nouveaux Tests

1. Créer le fichier dans le bon dossier
2. Importer les modules nécessaires
3. Mocker les dépendances externes
4. Suivre la structure existante
5. Mettre à jour la couverture si nécessaire