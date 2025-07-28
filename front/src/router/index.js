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
import { useAuthStore } from '../stores/authStore'

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { requiresAuth: true } // <- nécessite d'être connecté
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
    name: 'Cart',
    component: CartView
  },
  {
    path: '/checkout',
    name: 'checkout',
    component: OrderView
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfilView
  },
  {
    path: '/wishlist',
    name: 'wishlist',
    component: WishlistView
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
  component: OrderConfirmation
},
  {
    path: '/payment-success',
    name: 'payment-success',
    component: PaymentSuccess
  },
  {
    path: '/payment-cancel',
    name: 'payment-cancel',
    component: PaymentCancel
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
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
