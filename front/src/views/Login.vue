<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Header avec icône -->
      <div class="header">
        <div class="logo-circle">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10,17 15,12 10,7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
        </div>
        <h2 class="title">Bon retour !</h2>
        <p class="subtitle">Connectez-vous à votre compte</p>
      </div>

      <form @submit.prevent="handleLogin" class="form" novalidate>
        <!-- Champ Email avec icône -->
        <div class="input-group">
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22,6 12,13 2,6"/>
            </svg>
            <input 
              v-model="form.email"
              type="email" 
              placeholder="Adresse e-mail" 
              class="input-field"
              required 
            />
          </div>
        </div>

        <!-- Champ Mot de passe avec icône et toggle -->
        <div class="input-group">
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <circle cx="12" cy="16" r="1"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <input 
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Mot de passe" 
              class="input-field"
              required 
            />
            <button 
              type="button" 
              class="password-toggle"
              @click="togglePassword"
              :aria-label="showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'"
            >
              <svg v-if="!showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Message d'erreur avec icône -->
        <div v-if="error" class="error-message">
          <svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          {{ error }}
        </div>

        <!-- Bouton de connexion avec loader -->
        <button type="submit" class="login-button" :disabled="authStore.isLoading">
          <span v-if="!authStore.isLoading" class="button-content">
            <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
              <polyline points="10,17 15,12 10,7"/>
              <line x1="15" y1="12" x2="3" y2="12"/>
            </svg>
            Se connecter
          </span>
          <span v-else class="loading-content">
            <div class="spinner"></div>
            Connexion...
          </span>
        </button>
      </form>

      <!-- Séparateur -->
      <div class="divider">
        <span class="divider-text">ou</span>
      </div>

      <!-- Lien d'inscription -->
      <p class="register-link">
        Pas encore de compte ?
        <router-link to="/register" class="link">Créer un compte gratuitement</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const router = useRouter()
const error = ref('')
const showPassword = ref(false)

const form = ref({
  email: '',
  password: ''
})

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

const handleLogin = async () => {
  try {
    error.value = ''

    if (!form.value.email || !form.value.password) {
      error.value = 'Veuillez remplir tous les champs'
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)) {
      error.value = 'Adresse e-mail invalide'
      return
    }

    if (form.value.password.length < 6) {
      error.value = 'Le mot de passe doit contenir au moins 6 caractères'
      return
    }

    await authStore.login(form.value.email, form.value.password)

    if (authStore.error) {
      error.value = authStore.error
      return
    }

    router.push('/')

  } catch (err) {
    console.error('Erreur connexion:', err)
    error.value = err.message || 'Erreur lors de la connexion'
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.login-container {
  max-width: 420px;
  width: 100%;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 3rem 2.5rem;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2);
  animation: slideUp 0.6s ease-out;
}

.header {
  text-align: center;
  margin-bottom: 2.5rem;
}

.logo-circle {
  width: 64px;
  height: 64px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.logo-icon {
  width: 28px;
  height: 28px;
  color: white;
}

.title {
  font-size: 2rem;
  font-weight: 700;
  color: #1a202c;
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, #667eea, #764ba2);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  color: #64748b;
  font-size: 1rem;
  font-weight: 400;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.input-group {
  display: flex;
  flex-direction: column;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  left: 1rem;
  width: 20px;
  height: 20px;
  color: #9ca3af;
  z-index: 1;
}

.input-field {
  width: 100%;
  padding: 1.125rem 1.25rem 1.125rem 3rem;
  border: 2px solid transparent;
  background: #f8fafc;
  border-radius: 16px;
  font-size: 1rem;
  color: #1a202c;
  transition: all 0.3s ease;
}

.input-field:focus {
  outline: none;
  background: white;
  border-color: #667eea;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1);
}

.input-field::placeholder {
  color: #9ca3af;
}

.password-toggle {
  position: absolute;
  right: 1rem;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  color: #9ca3af;
  transition: color 0.2s ease;
}

.password-toggle:hover {
  color: #667eea;
}

.password-toggle svg {
  width: 20px;
  height: 20px;
}

.forgot-password {
  text-align: right;
  margin-top: -0.5rem;
}

.forgot-link {
  color: #667eea;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.forgot-link:hover {
  color: #764ba2;
  text-decoration: underline;
}

.error-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #ef4444;
  background: rgba(239, 68, 68, 0.1);
  padding: 1rem;
  border-radius: 12px;
  font-size: 0.9rem;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.error-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.login-button {
  width: 100%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  padding: 1.25rem;
  border: none;
  border-radius: 16px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(102, 126, 234, 0.4);
}

.login-button:active:not(:disabled) {
  transform: translateY(0);
}

.login-button:disabled {
  cursor: not-allowed;
  opacity: 0.7;
}

.button-content,
.loading-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.button-icon {
  width: 20px;
  height: 20px;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.divider {
  position: relative;
  margin: 2rem 0;
  text-align: center;
}

.divider::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: #e2e8f0;
}

.divider-text {
  background: rgba(255, 255, 255, 0.95);
  color: #9ca3af;
  padding: 0 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  position: relative;
}

.register-link {
  text-align: center;
  color: #64748b;
  font-size: 0.95rem;
}

.link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s ease;
}

.link:hover {
  color: #764ba2;
  text-decoration: underline;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 480px) {
  .login-container {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }

  .title {
    font-size: 1.75rem;
  }

  .input-field {
    padding: 1rem 1rem 1rem 2.75rem;
  }
}

/* Focus visible pour l'accessibilité */
.login-button:focus-visible,
.input-field:focus-visible {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}
</style>
