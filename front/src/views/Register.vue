<template>
  <div class="register-page">
    <div class="register-container">
      <!-- Header avec icône -->
      <div class="header">
        <div class="logo-circle">
          <svg class="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="8.5" cy="7" r="4"/>
            <line x1="20" y1="8" x2="20" y2="14"/>
            <line x1="23" y1="11" x2="17" y2="11"/>
          </svg>
        </div>
        <h2 class="title">Rejoignez-nous !</h2>
        <p class="subtitle">Créez votre compte en quelques secondes</p>
      </div>

      <form @submit.prevent="handleRegister" class="form" novalidate>
        <!-- Champ Nom avec icône -->
        <div class="input-group">
          <div class="input-wrapper">
            <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            <input
              v-model="form.name"
              type="text"
              placeholder="Nom complet"
              class="input-field"
              required 
            />
          </div>
        </div>

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

        <!-- Champ Téléphone avec icône et indicatif pays -->
        <div class="input-group">
          <div class="input-wrapper">
              <svg class="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <input
                v-model="form.phone"
                type="tel"
                placeholder="Numéro de téléphone"
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
              placeholder="Mot de passe (min. 6 caractères)"
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
          <!-- Indicateur de force du mot de passe -->
          <div class="password-strength" v-if="form.password">
            <div class="strength-bar">
              <div 
                class="strength-fill" 
                :class="passwordStrength.class"
                :style="{ width: passwordStrength.width }"
              ></div>
            </div>
            <span class="strength-text" :class="passwordStrength.class">
              {{ passwordStrength.text }}
            </span>
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

        <!-- Bouton d'inscription avec loader -->
        <button type="submit" class="register-button" :disabled="authStore.isLoading">
          <span v-if="!authStore.isLoading" class="button-content">
            <svg class="button-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="8.5" cy="7" r="4"/>
              <line x1="20" y1="8" x2="20" y2="14"/>
              <line x1="23" y1="11" x2="17" y2="11"/>
            </svg>
            Créer mon compte
          </span>
          <span v-else class="loading-content">
            <div class="spinner"></div>
            Création...
          </span>
        </button>
      </form>

      <!-- Séparateur -->
      <div class="divider">
        <span class="divider-text">ou</span>
      </div>

      <!-- Lien de connexion -->
      <p class="login-link">
        Déjà inscrit ?
        <router-link to="/login" class="link">Se connecter maintenant</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const router = useRouter()
const error = ref('')
const showPassword = ref(false)

const form = ref({
  name: '',
  email: '',
  phone: '',
  password: ''
})

const togglePassword = () => {
  showPassword.value = !showPassword.value
}

// Calculer la force du mot de passe
const passwordStrength = computed(() => {
  const password = form.value.password
  if (!password) return { width: '0%', class: 'weak', text: '' }
  
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 8) score++
  if (/[A-Z]/.test(password)) score++
  if (/[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  
  if (score < 3) return { width: '33%', class: 'weak', text: 'Faible' }
  if (score < 5) return { width: '66%', class: 'medium', text: 'Moyen' }
  return { width: '100%', class: 'strong', text: 'Fort' }
})

const handleRegister = async () => {
  try {
    error.value = ''

    if (!form.value.name || !form.value.email || !form.value.phone || !form.value.password) {
      error.value = 'Veuillez remplir tous les champs'
      return
    }

    form.value.name = form.value.name.replace(/\s+/g, ' ').trim()
    if (form.value.name.length < 3 || !/^[\p{L}'-]+(?: [\p{L}'-]+)*$/u.test(form.value.name)) {
      error.value = "Le nom doit contenir au moins 3 caractères et uniquement des lettres, espaces simples, apostrophes ou traits d'union"
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

    if (!/^\d{10}$/.test(form.value.phone)) {
      error.value = 'Numéro de téléphone invalide (10 chiffres)'
      return
    }

    await authStore.register(form.value)

    if (authStore.error) {
      error.value = authStore.error
      return
    }

    router.push('/')

  } catch (err) {
    console.error('Erreur inscription:', err)
    error.value = err.message || 'Erreur lors de l\'inscription'
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.register-container {
  max-width: 450px;
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

/* Champ téléphone spécial */
.phone-wrapper {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.country-code {
  background: #f8fafc;
  border: 2px solid transparent;
  border-radius: 16px;
  padding: 1.125rem 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #64748b;
  min-width: 85px;
  transition: all 0.3s ease;
}

.country-icon {
  width: 18px;
  height: 18px;
}

.phone-input-wrapper {
  flex: 1;
}

.phone-input {
  padding-left: 1.25rem !important;
}

/* Toggle mot de passe */
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

/* Indicateur de force du mot de passe */
.password-strength {
  margin-top: 0.75rem;
}

.strength-bar {
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.strength-fill {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 2px;
}

.strength-fill.weak { background: #ef4444; }
.strength-fill.medium { background: #f59e0b; }
.strength-fill.strong { background: #10b981; }

.strength-text {
  font-size: 0.8rem;
  font-weight: 500;
}

.strength-text.weak { color: #ef4444; }
.strength-text.medium { color: #f59e0b; }
.strength-text.strong { color: #10b981; }

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

.register-button {
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
  margin-top: 0.5rem;
}

.register-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(102, 126, 234, 0.4);
}

.register-button:active:not(:disabled) {
  transform: translateY(0);
}

.register-button:disabled {
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

.login-link {
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
  .register-container {
    padding: 2rem 1.5rem;
    margin: 1rem;
  }

  .title {
    font-size: 1.75rem;
  }

  .phone-wrapper {
    flex-direction: column;
    gap: 1rem;
  }

  .country-code {
    width: 100%;
    justify-content: center;
  }

  .input-field {
    padding: 1rem 1rem 1rem 2.75rem;
  }
}

/* Focus visible pour l'accessibilité */
.register-button:focus-visible,
.input-field:focus-visible {
  outline: 2px solid #667eea;
  outline-offset: 2px;
}
</style>
