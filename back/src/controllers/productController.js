const pool = require('../db');

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// Get a product by ID
const getProductById = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produit non trouvé.' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// Create a new product
const createProduct = async (req, res) => {
  const { name, description, price, type, image, available, vegetarian } = req.body;

  if (!name || !price || !type) {
    return res.status(400).json({ error: 'Champs requis manquants.' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO products (name, description, price, type, image, available, vegetarian)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name, description || '', price, type, image || '', available ?? true, vegetarian ?? false]
    );
    res.status(201).json({ message: 'Produit créé avec succès.', product: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// Update a product
const updateProduct = async (req, res) => {
    const { id } = req.params;
    const { name, description, price, type, image, available, vegetarian } = req.body;
    
    try {
        const result = await pool.query(
        `UPDATE products
         SET name = $1, description = $2, price = $3, type = $4, image = $5, available = $6, vegetarian = $7
         WHERE id = $8
         RETURNING *`,
        [name, description || '', price, type, image || '', available ?? true, vegetarian ?? false, id]
        );
    
        if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Produit non trouvé.' });
        }
    
        res.json({ message: 'Produit mis à jour avec succès.', product: result.rows[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur serveur.' });
    }
};

// Delete a product
const deleteProduct = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Produit non trouvé.' });
    }
    res.json({ message: 'Produit supprimé.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

// Get all products by type
const getProductsByType = async (req, res) => {
  const { type } = req.params;
  try {
    const result = await pool.query('SELECT * FROM products WHERE type = $1 ORDER BY created_at DESC', [type]);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur serveur.' });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductsByType
};
