const pool = require("../db");
const { hashPassword, comparePasswords } = require("../utils/hash");
const { generateToken } = require("../utils/jwt");

// Inscription function
const register = async (req, res) => {
  const { name, email, password_hash, phone, role } = req.body;

  if (!name || !email || !password_hash) {
    return res.status(400).json({ error: 'Champs requis manquants.' });
  }

  try {
    const utilisateurExiste = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );
    if (utilisateurExiste.rows.length > 0) {
      return res.status(400).json({ error: 'Email déjà utilisé.' });
    }

    const passwordHash = await hashPassword(password_hash);

    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, phone, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, phone, role`,
      [name, email, passwordHash, phone || null, role || 'client']
    );

    const user = result.rows[0];

    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    return res.status(201).json({
      message: 'Inscription réussie',
      token,
      user: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};


// Login function
const login = async (req, res) => {
  const { email, password_hash } = req.body;

  if (!email || !password_hash) {
    return res.status(400).json({ error: 'Champs requis manquants.' });
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    const passwordValid = await comparePasswords(password_hash, user.password_hash);
    if (!passwordValid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect.' });
    }

    const token = generateToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    res.status(200).json({
      message: 'Connexion réussie',
      token,
      utilisateur: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// Delete account function
const deleteAccount = async (req, res) => {
  const userId = req.user.id;
  try {
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    res.status(200).json({ message: 'Compte supprimé avec succès.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};


// Function to get the connected user's information
const me = (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, deleteAccount, me };
