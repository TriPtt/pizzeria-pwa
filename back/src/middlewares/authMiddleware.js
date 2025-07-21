const jwt = require("jsonwebtoken");
const { verifyToken } = require("../utils/jwt");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Token manquant ou invalide." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const utilisateur = verifyToken(token);
    req.user = utilisateur;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Token invalide ou expiré." });
  }
};

module.exports = authMiddleware;
