import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/Login.vue';
import RegisterView from '../views/Register.vue';
import HomeView from '../views/Home.vue';
import CartView from '../views/Cart.vue';
import OrderView from '../views/Order.vue';
import ProfilView from '../views/Profil.vue';
import WishlistView from '../views/Wishlist.vue';
import OrdersView from '../views/Orders.vue';
import OrderConfirmation from '../views/OrderConfirmation.vue';
import PaymentSuccess from '../views/PaymentSuccess.vue'
import PaymentCancel from '../views/PaymentCancel.vue'
import Reservations from '../views/Reservations.vue';
import MyReservations from '../views/MyReservations.vue';
import Menu from '../views/Menu.vue';
import Contact from '../views/Contact.vue';
import { useAuthStore } from '../stores/authStore'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true } 
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView
  },
  {
    path: '/cart',
    name: 'cart',
    component: CartView,
    meta: { requiresAuth: true }
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: OrderView,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfilView,
    meta: { requiresAuth: true }
  },
  {
    path: '/wishlist',
    name: 'wishlist',
    component: WishlistView,
    meta: { requiresAuth: true }
  },
  {
    path: '/orders',
    name: 'orders',
    component: OrdersView,
    meta: { requiresAuth: true }
  },
  {
    path: '/order-confirmation',
    name: 'order-confirmation',
    component: OrderConfirmation,
    meta: { requiresAuth: true }
  },
  {
    path: '/payment-success',
    name: 'payment-success',
    component: PaymentSuccess,
    meta: { requiresAuth: true }
  },
  {
    path: '/payment-cancel',
    name: 'payment-cancel',
    component: PaymentCancel,
    meta: { requiresAuth: true }
  },
  {
    path: '/reservations',
    name: 'reservations',
    component: Reservations,
    meta: { requiresAuth: true }
  },
  {
    path: '/mes-reservations',
    name: 'MesReservations',
    component: MyReservations,
    meta: { requiresAuth: true }
  },
  {
    path: '/products',
    name: 'menu',
    component: Menu
  },
  {
    path: '/contact',
    name: 'contact',
    component: Contact
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    if (to.hash) {
      return {
        el: to.hash,
        behavior: 'smooth'
      }
    }
    return { 
      top: 0, 
      left: 0,
      behavior: 'smooth'
    }
  }
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' })
  } else if ((to.name === 'login' || to.name === 'register') && isAuthenticated) {
    next({ name: 'home' })
  } else {
    next()
  }
})
export default router
