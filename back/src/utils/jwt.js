const jwt = require("jsonwebtoken");

const secret = process.env.JWT_SECRET;

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      nom: user.nom,
      email: user.email,
      rôle: user.role,
    },
    secret,
    { expiresIn: "7d" } // Token valide pendant 7 jours
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, secret);
};

module.exports = { generateToken, verifyToken };
