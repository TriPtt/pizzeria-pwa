import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import BottomNavigation from '../BottomNavigation.vue'

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: 'Home' } },
    { path: '/products', component: { template: 'Products' } },
    { path: '/profile', component: { template: 'Profile' } },
    { path: '/cart', component: { template: 'Cart' } }
  ]
})

describe('BottomNavigation', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(BottomNavigation, {
      props: {
        cartCount: 3,
        hideOnScroll: false
      },
      global: {
        plugins: [router]
      }
    })
  })

  it('📱 devrait afficher tous les onglets', () => {
    const navItems = wrapper.findAll('.nav-item')
    expect(navItems).toHaveLength(4)
    
    expect(wrapper.text()).toContain('Accueil')
    expect(wrapper.text()).toContain('Menu')
    expect(wrapper.text()).toContain('Profil')
    expect(wrapper.text()).toContain('Panier')
  })

  it('🔢 devrait afficher le badge du panier', () => {
    const badge = wrapper.find('.nav-badge')
    expect(badge.exists()).toBe(true)
    expect(badge.text()).toBe('3')
  })

  it('🔢 devrait gérer les gros chiffres', async () => {
    await wrapper.setProps({ cartCount: 150 })
    const badge = wrapper.find('.nav-badge')
    expect(badge.text()).toBe('99+')
  })

  it('🖱️ devrait émettre l\'événement lors du clic', async () => {
    const menuBtn = wrapper.findAll('.nav-item')[1] // Menu
    await menuBtn.trigger('click')
    
    expect(wrapper.emitted('tabChange')).toBeTruthy()
    expect(wrapper.emitted('tabChange')[0][0]).toMatchObject({
      id: 'menu',
      label: 'Menu'
    })
  })

  it('🎨 devrait appliquer la classe active', async () => {
    router.push('/products')
    await wrapper.vm.$nextTick()
    
    const menuBtn = wrapper.findAll('.nav-item')[1] // Menu
    expect(menuBtn.classes()).toContain('active')
  })
})
