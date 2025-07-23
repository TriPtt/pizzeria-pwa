import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ProductCard from '../ProductCard.vue'

describe('ProductCard', () => {
  let wrapper
  const mockProduct = {
    id: 1,
    name: 'Pizza Margherita',
    price: 12.50,
    image: '/images/pizza1.jpg',
    category: 'pizza',
    description: 'Une délicieuse pizza classique',
    vegetarian: true,
    available: true
  }

  beforeEach(() => {
    wrapper = mount(ProductCard, {
      props: {
        product: mockProduct,
        loading: false
      }
    })
  })

  it('📝 devrait afficher le produit correctement', () => {
    expect(wrapper.find('.product-name').text()).toBe('Pizza Margherita')
    expect(wrapper.find('.product-price').text()).toContain('12,50')
    expect(wrapper.find('.product-description').text()).toBe('Une délicieuse pizza classique')
  })

  it('🌱 devrait afficher le badge végétarien', () => {
    expect(wrapper.find('.vegetarian-badge').exists()).toBe(true)
    expect(wrapper.find('.vegetarian-badge').text()).toBe('🌱 Végétarien')
  })

  it('❤️ devrait gérer les favoris', async () => {
    const favoriteBtn = wrapper.find('.favorite-btn')
    await favoriteBtn.trigger('click')
    
    expect(wrapper.emitted('toggle-favorite')).toBeTruthy()
    expect(wrapper.emitted('toggle-favorite')[0]).toEqual([mockProduct])
  })

  it('🛒 devrait ajouter au panier', async () => {
    const addBtn = wrapper.find('.add-to-cart-btn')
    await addBtn.trigger('click')
    
    expect(wrapper.emitted('add-to-cart')).toBeTruthy()
    expect(wrapper.emitted('add-to-cart')[0]).toEqual([mockProduct])
  })

  it('⏳ devrait afficher l\'état de chargement', async () => {
    await wrapper.setProps({ loading: true })
    expect(wrapper.find('.loading-shimmer').exists()).toBe(true)
  })

  it('❌ devrait gérer l\'indisponibilité', async () => {
    await wrapper.setProps({
      product: { ...mockProduct, available: false }
    })
    
    expect(wrapper.find('.unavailable-badge').exists()).toBe(true)
    expect(wrapper.find('.add-to-cart-btn').attributes('disabled')).toBeDefined()
  })
})
