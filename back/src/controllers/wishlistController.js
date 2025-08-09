const pool = require('../db')

const wishlistController = {
  // 📝 Récupérer la wishlist de l'utilisateur
  getWishlist: async (req, res) => {
    try {
      const userId = req.user.id
      // console.log('🔍 Fetching wishlist for user:', userId)

      const query = `
        SELECT 
          w.id as wishlist_id,
          w.product_id,
          w.created_at,
          p.id,
          p.name,
          p.description,
          p.price,
          p.image,
          p.type,
          p.available,
          p.vegetarian
        FROM wishlists w
        JOIN products p ON w.product_id = p.id
        WHERE w.user_id = $1
        ORDER BY w.created_at DESC
      `

      const result = await pool.query(query, [userId])
      
      // console.log(`✅ Found ${result.rows.length} wishlist items`)
      
      res.json({
        success: true,
        items: result.rows,
        count: result.rows.length
      })

    } catch (error) {
      console.error('❌ Error fetching wishlist:', error)
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération de la wishlist'
      })
    }
  },

  // 📝 Ajouter un produit à la wishlist
  addToWishlist: async (req, res) => {
    const userId = req.user.id
    const { product_id } = req.body
    // console.log('🔍 Adding to wishlist:', { userId, product_id })

    // Validation
    if (!product_id || isNaN(product_id)) {
        return res.status(400).json({
            success: false,
            message: 'Product ID invalide'
            })
    }

    try {
        const insertQuery = `
            INSERT INTO wishlists (user_id, product_id)
            VALUES ($1, $2)
            RETURNING id
        `
        const result = await pool.query(insertQuery, [userId, product_id])

        // console.log('✅ Product added to wishlist:', result.rows[0].id)

        res.json({
            success: true,
            message: 'Produit ajouté à la wishlist',
            wishlistItemId: result.rows[0].id
        })
    } catch (error) {
        console.error('❌ Error adding to wishlist:', error)
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'ajout à la wishlist'
        })
    }
  },

  // 📝 Supprimer un produit de la wishlist
  removeFromWishlist: async (req, res) => {
    try {
      const userId = req.user.id
      const productId = parseInt(req.params.productId)

      // Validation
      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Product ID invalide'
        })
      }

      // console.log('🔍 Removing from wishlist:', { userId, productId })

      // Récupérer le nom du produit avant suppression
      const productQuery = `
        SELECT p.name 
        FROM wishlists w
        JOIN products p ON w.product_id = p.id
        WHERE w.user_id = $1 AND w.product_id = $2
      `
      const productResult = await pool.query(productQuery, [userId, productId])

      // Supprimer de la wishlist
      const deleteQuery = `
        DELETE FROM wishlists 
        WHERE user_id = $1 AND product_id = $2
        RETURNING id
      `
      
      const result = await pool.query(deleteQuery, [userId, productId])
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Produit non trouvé dans la wishlist'
        })
      }
      
      const productName = productResult.rows[0]?.name || 'Produit'
      // console.log('✅ Product removed from wishlist')
      
      res.json({
        success: true,
        message: `"${productName}" supprimé de la wishlist`
      })

    } catch (error) {
      console.error('❌ Error removing from wishlist:', error)
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la suppression'
      })
    }
  },

  // 📝 Vider toute la wishlist
  clearWishlist: async (req, res) => {
    try {
      const userId = req.user.id
      // console.log('🔍 Clearing wishlist for user:', userId)

      const deleteQuery = 'DELETE FROM wishlists WHERE user_id = $1 RETURNING id'
      const result = await pool.query(deleteQuery, [userId])
      
      // console.log(`✅ Cleared ${result.rows.length} wishlist items`)
      
      res.json({
        success: true,
        message: result.rows.length > 0 
          ? `${result.rows.length} produits supprimés de la wishlist`
          : 'La wishlist était déjà vide',
        removed_count: result.rows.length
      })

    } catch (error) {
      console.error('❌ Error clearing wishlist:', error)
      res.status(500).json({
        success: false,
        message: 'Erreur lors du vidage de la wishlist'
      })
    }
  },

  // 📝 Vérifier si un produit est dans la wishlist
  checkInWishlist: async (req, res) => {
    try {
      const userId = req.user.id
      const productId = parseInt(req.params.productId)

      // Validation
      if (!productId || isNaN(productId)) {
        return res.status(400).json({
          success: false,
          message: 'Product ID invalide'
        })
      }

      const checkQuery = `
        SELECT w.id, w.created_at, p.name
        FROM wishlists w
        JOIN products p ON w.product_id = p.id
        WHERE w.user_id = $1 AND w.product_id = $2
      `
      
      const result = await pool.query(checkQuery, [userId, productId])
      
      res.json({
        success: true,
        in_wishlist: result.rows.length > 0,
        product_name: result.rows[0]?.name || null,
        added_at: result.rows[0]?.created_at || null
      })

    } catch (error) {
      console.error('❌ Error checking wishlist:', error)
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la vérification'
      })
    }
  },

  // 📝 Obtenir les statistiques de la wishlist
  getWishlistStats: async (req, res) => {
    try {
      const userId = req.user.id

      const statsQuery = `
        SELECT 
          COUNT(*) as total_items,
          COUNT(CASE WHEN p.available = true THEN 1 END) as available_items,
          COUNT(CASE WHEN p.vegetarian = true THEN 1 END) as vegetarian_items,
          COALESCE(SUM(p.price), 0) as total_value,
          MIN(w.created_at) as first_added,
          MAX(w.created_at) as last_added
        FROM wishlists w
        JOIN products p ON w.product_id = p.id
        WHERE w.user_id = $1
      `

      const result = await pool.query(statsQuery, [userId])
      const stats = result.rows[0]

      res.json({
        success: true,
        stats: {
          total_items: parseInt(stats.total_items),
          available_items: parseInt(stats.available_items),
          vegetarian_items: parseInt(stats.vegetarian_items),
          total_value: parseFloat(stats.total_value),
          first_added: stats.first_added,
          last_added: stats.last_added
        }
      })

    } catch (error) {
      console.error('❌ Error fetching wishlist stats:', error)
      res.status(500).json({
        success: false,
        message: 'Erreur lors de la récupération des statistiques'
      })
    }
  }
}

module.exports = wishlistController
