# Mesures de Sécurité - OWASP Top 10

## 1. Injection (SQL/NoSQL)
- Requêtes paramétrées avec pg
- Validation des entrées

## 2. Broken Authentication
- JWT sécurisé
- Hash bcrypt pour mots de passe
- Middleware d'authentification

## 3. Sensitive Data Exposure
- Variables d'environnement (.env)
- HTTPS obligatoire
- Secrets non commitées

## 4. XML External Entities (XXE)
- Pas de traitement XML

## 5. Broken Access Control
- Middleware d'autorisation par rôles
- Vérification des permissions

## 6. Security Misconfiguration
- Headers sécurisés
- CORS configuré

## 7. Cross-Site Scripting (XSS) (à ajouter)
- Validation entrées
- CSP headers

## 8. Insecure Deserialization
- Validation JSON stricte

## 9. Using Components with Known Vulnerabilities
- CI/CD
- Dépendances à jour

## 10. Insufficient Logging & Monitoring
- Logs d'erreurs
- Monitoring des tentatives de connexion (à ajouter)