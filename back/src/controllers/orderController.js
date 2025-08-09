const pool = require("../db");

// Créer une commande
exports.createOrder = async (req, res) => {
  const client = await pool.connect();
  try {
    // Normalize incoming body: accept either customer_name/customer_phone
    // or customer: { name, phone }
    const {
      items: rawItems = [],
      customer_name: bodyCustomerName,
      customer_phone: bodyCustomerPhone,
      pickup_date,
      pickup_time,
      notes,
      total_amount
    } = req.body;

    const customer_name = (bodyCustomerName ?? req.body.customer?.name ?? '').trim();
    const customer_phone = (bodyCustomerPhone ?? req.body.customer?.phone ?? '').trim();

    // Basic validations
    if (!rawItems || rawItems.length === 0) {
      return res.status(400).json({ message: "Aucun article fourni" });
    }

    if (!customer_name || !customer_phone) {
      return res.status(400).json({ message: "Nom et téléphone requis" });
    }

    // Ensure user is present (adjust if orders can be anonymous)
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    // Normalize items: accept either item.product_id or item.id
    const items = rawItems.map(item => ({
      product_id: item.product_id ?? item.id ?? null,
      quantity: item.quantity ?? item.qty ?? 1,
      base_price: item.base_price ?? item.price ?? item.unit_price ?? 0,
      unit_price: item.unit_price ?? item.price ?? item.unit_price ?? 0,
      customizations: item.customizations ?? {}
    }));

    // Verify all product_id present
    const missingPid = items.find(i => !i.product_id);
    if (missingPid) {
      return res.status(400).json({ message: "Chaque item doit contenir product_id (ou id)" });
    }

    await client.query("BEGIN");

    // Récupération des produits pour validation et noms
    const productIds = items.map(item => item.product_id);
    const productQuery = await client.query(
      "SELECT id, name, price FROM products WHERE id = ANY($1::int[])",
      [productIds]
    );

    const products = productQuery.rows;
    const nameMap = {};
    products.forEach(p => { nameMap[p.id] = p.name; });

    // Vérifier que tous les produits existent
    for (const item of items) {
      if (!nameMap[item.product_id]) {
        // Rollback and return a clear error
        await client.query("ROLLBACK");
        return res.status(400).json({ message: `Produit ID ${item.product_id} non trouvé` });
      }
    }

    // Utiliser le total calculé côté front (fallback 0)
    const finalTotal = parseFloat(total_amount) || 0;

    // Insertion dans orders
    const orderRes = await client.query(
      `INSERT INTO orders (user_id, total_price, status) 
       VALUES ($1, $2, $3) 
       RETURNING id, created_at`,
      [req.user.id, finalTotal, 'pending']
    );

    const orderId = orderRes.rows[0].id;
    const createdAt = orderRes.rows[0].created_at;

    // Insertion dans order_items
    const insertPromises = items.map(item => {
      const basePrice = parseFloat(item.base_price) || 0;
      const unitPrice = parseFloat(item.unit_price) || 0;
      const quantity = parseInt(item.quantity) || 1;

      return client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, base_price, unit_price, created_at) 
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [orderId, item.product_id, quantity, basePrice, unitPrice, new Date()]
      );
    });

    await Promise.all(insertPromises);
    await client.query("COMMIT");

    // Préparation de la réponse
    const responseItems = items.map(item => {
      const basePrice = parseFloat(item.base_price) || 0;
      const unitPrice = parseFloat(item.unit_price) || 0;
      const quantity = parseInt(item.quantity) || 1;
      return {
        product_id: item.product_id,
        name: nameMap[item.product_id],
        quantity,
        base_price: basePrice,
        unit_price: unitPrice,
        total: unitPrice * quantity,
        customizations: item.customizations || {}
      };
    });

    res.status(201).json({
      success: true,
      message: "Commande créée avec succès",
      order: {
        id: orderId,
        order_number: `CMD-${String(orderId).padStart(3, '0')}`,
        total_price: finalTotal,
        status: 'pending',
        created_at: createdAt,
        customer_name,
        customer_phone,
        pickup_date,
        pickup_time,
        notes,
        items: responseItems
      }
    });

  } catch (error) {
    try { await client.query("ROLLBACK"); } catch (e) { /* ignore */ }
    console.error('❌ Erreur création commande:', error);
    // Provide clearer client error payloads for validation errors
    if (error.message && error.message.includes('non trouvé')) {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Erreur lors de la création de la commande" });
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