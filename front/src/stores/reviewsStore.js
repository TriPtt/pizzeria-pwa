import { defineStore } from 'pinia'

export const useReviewsStore = defineStore('reviews', {
  state: () => ({
    reviews: {}, // { productId: { rating, reviews, stats } }
    loading: false,
    error: null
  }),

  getters: {
    getProductReviews: (state) => (productId) => {
      return state.reviews[productId] || {
        averageRating: 0,
        totalReviews: 0,
        totalRatings: 0,
        reviews: [],
        ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      }
    },

    getAverageRating: (state) => (productId) => {
      return state.reviews[productId]?.averageRating || 0
    }
  },

  actions: {
    async fetchProductReviews(productId) {
      this.loading = true
      try {
        // Simulation API - remplacez par votre vraie API
        const response = await this.simulateAPI(productId)
        this.reviews[productId] = response
        return response
      } catch (error) {
        this.error = error.message
        throw error
      } finally {
        this.loading = false
      }
    },

    async addReview(productId, review) {
      try {
        // Simulation ajout avis
        if (!this.reviews[productId]) {
          await this.fetchProductReviews(productId)
        }
        
        const productReviews = this.reviews[productId]
        productReviews.reviews.unshift({
          id: Date.now(),
          ...review,
          date: new Date().toISOString()
        })
        
        // Recalculer la moyenne
        this.recalculateStats(productId)
        
        return true
      } catch (error) {
        this.error = error.message
        throw error
      }
    },

    recalculateStats(productId) {
      const productReviews = this.reviews[productId]
      if (!productReviews) return

      const reviews = productReviews.reviews
      const totalReviews = reviews.length
      const totalRatings = totalReviews // Supposons que chaque avis a une note

      if (totalRatings === 0) {
        productReviews.averageRating = 0
        return
      }

      const sum = reviews.reduce((acc, review) => acc + review.rating, 0)
      productReviews.averageRating = sum / totalRatings
      productReviews.totalReviews = totalReviews
      productReviews.totalRatings = totalRatings

      // Distribution des notes
      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
      reviews.forEach(review => {
        distribution[review.rating]++
      })
      productReviews.ratingDistribution = distribution
    },

    // Simulation API
    async simulateAPI(productId) {
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Données simulées
      const mockReviews = [
        {
          id: 1,
          author: "Marie D.",
          rating: 5,
          comment: "Excellente pizza ! Pâte parfaite et garniture généreuse.",
          date: "2024-01-15T10:30:00Z",
          verified: true
        },
        {
          id: 2,
          author: "Thomas L.",
          rating: 4,
          comment: "Très bonne pizza, livraison rapide. Je recommande !",
          date: "2024-01-14T19:45:00Z",
          verified: true
        },
        {
          id: 3,
          author: "Sophie M.",
          rating: 5,
          comment: "Ma pizza préférée ! Toujours aussi délicieuse.",
          date: "2024-01-13T12:20:00Z",
          verified: false
        }
      ]

      const totalRatings = mockReviews.length + 40 // + ratings sans commentaires
      const ratingsSum = mockReviews.reduce((sum, r) => sum + r.rating, 0) + (40 * 4.3)
      
      return {
        averageRating: Math.round((ratingsSum / totalRatings) * 10) / 10,
        totalReviews: mockReviews.length,
        totalRatings: totalRatings,
        reviews: mockReviews,
        ratingDistribution: { 5: 25, 4: 12, 3: 4, 2: 2, 1: 0 }
      }
    }
  }
})
