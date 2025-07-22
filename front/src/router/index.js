import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/Login.vue';
import RegisterView from '../views/Register.vue';
import HomeView from '../views/Home.vue';


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
  // ajoute d'autres routes ici
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 🔐 Guard globale
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!localStorage.getItem('token')

  if (to.meta.requiresAuth && !isAuthenticated) {
    next({ name: 'login' }) // si la route est protégée et pas connecté → redirect login
  } else if ((to.name === 'login' || to.name === 'register') && isAuthenticated) {
    next({ name: 'home' }) // si connecté et essaie d'aller sur login/register → redirect home
  } else {
    next() // sinon continue normalement
  }
})

export default router
