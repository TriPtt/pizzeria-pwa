const pool = require("../db");
const { hashPassword } = require("../utils/hash");

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

module.exports = { register };
