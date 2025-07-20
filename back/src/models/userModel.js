const db = require("../db");

const getAllUsers = async () => {
  const result = await db.query("SELECT * FROM users");
  return result.rows;
};

const getUserById = async (id) => {
  const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
  return result.rows[0];
};

const createUser = async ({ nom, email, mot_de_passe, role }) => {
  const result = await db.query(
    "INSERT INTO users (nom, email, mot_de_passe, role) VALUES ($1, $2, $3, $4) RETURNING *",
    [nom, email, mot_de_passe, role]
  );
  return result.rows[0];
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
};
