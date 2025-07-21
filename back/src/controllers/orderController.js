const pool = require("../db");

// Créer une commande
exports.createOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    const { items } = req.body; // [{ product_id: 1, quantity: 2 }, ...]

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items provided" });
    }

    await client.query("BEGIN");

    // Récupération des prix des produits
    const productIds = items.map(item => item.product_id);
    const productQuery = await client.query(
      "SELECT id, price FROM products WHERE id = ANY($1)",
      [productIds]
    );

    const products = productQuery.rows;
    const priceMap = {};
    products.forEach(p => priceMap[p.id] = p.price);

    // Calcul du prix total
    let total = 0;
    for (const item of items) {
      if (!priceMap[item.product_id]) {
        throw new Error(`Product ID ${item.product_id} not found`);
      }
      total += priceMap[item.product_id] * item.quantity;
    }

    // Insertion dans orders
    const orderRes = await client.query(
      `INSERT INTO orders (user_id, total_price) VALUES ($1, $2) RETURNING id`,
      [req.user.id, total]
    );

    const orderId = orderRes.rows[0].id;

    // Insertion dans order_items
    const insertPromises = items.map(item => {
      return client.query(
        `INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)`,
        [orderId, item.product_id, item.quantity]
      );
    });

    await Promise.all(insertPromises);

    await client.query("COMMIT");
    res.status(201).json({ message: "Order created", order_id: orderId });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ error: "Failed to create order" });
  } finally {
    client.release();
  }
};

// Récupérer toutes les commandes (admin uniquement)
exports.getAllOrders = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, u.email 
       FROM orders o 
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching orders" });
  }
};

// Récupérer une commande par ID avec ses items
exports.getOrderById = async (req, res) => {
  const orderId = req.params.id;
  try {
    const orderRes = await pool.query(
      `SELECT * FROM orders WHERE id = $1`,
      [orderId]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    const itemsRes = await pool.query(
      `SELECT oi.*, p.name, p.price 
       FROM order_items oi 
       JOIN products p ON oi.product_id = p.id 
       WHERE order_id = $1`,
      [orderId]
    );

    res.json({
      ...orderRes.rows[0],
      items: itemsRes.rows
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching order" });
  }
};
