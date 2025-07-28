const pool = require("../db");

// Créer une commande
exports.createOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    const { 
      items,           // [{ product_id: 1, quantity: 2 }, ...]
      customer_name,   // Nom du client
      customer_phone,  // Téléphone
      pickup_date,     // Date de retrait (optionnel)
      pickup_time,     // Heure de retrait (optionnel)
      notes           // Remarques (optionnel)
    } = req.body;

    console.log('📦 Création commande:', req.body);

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Aucun article fourni" });
    }

    if (!customer_name || !customer_phone) {
      return res.status(400).json({ message: "Nom et téléphone requis" });
    }

    await client.query("BEGIN");

    // Récupération des prix des produits
    const productIds = items.map(item => item.product_id);
    const productQuery = await client.query(
      "SELECT id, name, price FROM products WHERE id = ANY($1)",
      [productIds]
    );

    const products = productQuery.rows;
    const priceMap = {};
    const nameMap = {};
    
    products.forEach(p => {
      priceMap[p.id] = parseFloat(p.price);
      nameMap[p.id] = p.name;
    });

    // Calcul du prix total
    let total = 0;
    const orderItems = [];
    
    for (const item of items) {
      if (!priceMap[item.product_id]) {
        throw new Error(`Produit ID ${item.product_id} non trouvé`);
      }
      
      const itemTotal = priceMap[item.product_id] * item.quantity;
      total += itemTotal;
      
      orderItems.push({
        product_id: item.product_id,
        name: nameMap[item.product_id],
        quantity: item.quantity,
        price: priceMap[item.product_id],
        total: itemTotal
      });
    }

    // Insertion dans orders
    const orderRes = await client.query(
      `INSERT INTO orders (user_id, total_price, status) 
       VALUES ($1, $2, $3) 
       RETURNING id, created_at`,
      [req.user.id, total.toFixed(2), 'pending']
    );

    const orderId = orderRes.rows[0].id;
    const createdAt = orderRes.rows[0].created_at;

    // Insertion dans order_items
    const insertPromises = items.map(item => {
      return client.query(
        `INSERT INTO order_items (order_id, product_id, quantity) VALUES ($1, $2, $3)`,
        [orderId, item.product_id, item.quantity]
      );
    });

    await Promise.all(insertPromises);

    await client.query("COMMIT");

    // ✅ Réponse avec toutes les infos
    res.status(201).json({ 
      success: true,
      message: "Commande créée avec succès",
      order: {
        id: orderId,
        order_number: `CMD-${String(orderId).padStart(3, '0')}`,
        total_price: parseFloat(total.toFixed(2)),
        status: 'pending',
        created_at: createdAt,
        customer_name,
        customer_phone,
        pickup_date,
        pickup_time,
        notes,
        items: orderItems
      }
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error('❌ Erreur création commande:', error);
    
    if (error.message.includes('non trouvé')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Erreur lors de la création de la commande" });
    }
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


exports.getUserOrders = async (req, res) => {
  try {
    // Récupérer les commandes avec les items
    const result = await pool.query(
      `SELECT 
        o.id, 
        o.total_price, 
        o.status, 
        o.created_at,
        o.updated_at,
        CONCAT('CMD-', LPAD(o.id::text, 3, '0')) as order_number,
        json_agg(
          json_build_object(
            'name', p.name,
            'quantity', oi.quantity,
            'price', p.price
          )
        ) as items
       FROM orders o
       LEFT JOIN order_items oi ON o.id = oi.order_id
       LEFT JOIN products p ON oi.product_id = p.id
       WHERE o.user_id = $1
       GROUP BY o.id, o.total_price, o.status, o.created_at, o.updated_at
       ORDER BY o.created_at DESC`,
      [req.user.id]
    );
    
    res.json({ orders: result.rows });
  } catch (err) {
    console.error('Error fetching user orders:', err);
    res.status(500).json({ error: "Error fetching user orders" });
  }
};