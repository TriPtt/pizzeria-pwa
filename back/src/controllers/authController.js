const pool = require("../db");
const { hashPassword, comparePasswords } = require("../utils/hash");
const { generateToken } = require("../utils/jwt");

// Fonction d'inscription
const register = async (req, res) => {
  const { nom, email, mot_de_passe, telephone, role } = req.body;

  if (!nom || !email || !mot_de_passe) {
    return res.status(400).json({ error: "Champs requis manquants." });
  }

  try {
    const utilisateurExiste = await pool.query("SELECT * FROM users WHERE email = $1", [email]);

    if (utilisateurExiste.rows.length > 0) {
      return res.status(400).json({ error: "Email déjà utilisé." });
    }

    const motDePasseHashé = await hashPassword(mot_de_passe);

    const result = await pool.query(
      `INSERT INTO users (nom, email, mot_de_passe, telephone, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, nom, email, telephone, role`,
      [nom, email, motDePasseHashé, telephone || null, role || "client"]
    );

    return res.status(201).json({ message: "Inscription réussie", utilisateur: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

// Fonction de connexion
const login = async (req, res) => {
  const { email, mot_de_passe } = req.body;

  if (!email || !mot_de_passe) {
    return res.status(400).json({ error: "Champs requis manquants." });
  }

  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    const utilisateur = result.rows[0];

    if (!utilisateur) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    const motDePasseValide = await comparePasswords(mot_de_passe, utilisateur.mot_de_passe);

    if (!motDePasseValide) {
      return res.status(401).json({ error: "Email ou mot de passe incorrect." });
    }

    const token = generateToken(utilisateur);

    res.status(200).json({
      message: "Connexion réussie",
      token,
      utilisateur: {
        id: utilisateur.id,
        nom: utilisateur.nom,
        email: utilisateur.email,
        téléphone: utilisateur.téléphone,
        rôle: utilisateur.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erreur serveur." });
  }
};

// Fonction pour obtenir les informations de l'utilisateur connecté
const me = (req, res) => {
  res.json({ utilisateur: req.user });
};

module.exports = { register, login, me };
