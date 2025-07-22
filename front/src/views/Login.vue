<template>
  <div class="login-page">
    <div class="login-container">
      <h2 class="title">Se connecter</h2>
      <p class="subtitle">Connectez-vous à votre compte</p>

      <form @submit.prevent="handleLogin" class="form">
        <div class="input-group">
          <input 
            v-model="form.email" 
            type="email" 
            placeholder="Adresse e-mail" 
            class="input-field"
            required 
          />
        </div>
        
        <div class="input-group">
          <input 
            v-model="form.password_hash" 
            type="password" 
            placeholder="Mot de passe" 
            class="input-field"
            required 
          />
        </div>
        
        <div class="forgot-password">
          <a href="#" class="forgot-link">Mot de passe oublié ?</a>
        </div>
        
        <button type="submit" class="login-button">
          Se connecter
        </button>
      </form>
      
      <p class="register-link">
        Pas encore de compte ?
        <router-link to="/register" class="link">Créer un compte</router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const form = ref({
  email: '',
  password: ''
})

const handleLogin = async () => {
  try {
    const res = await axios.post('http://localhost:5000/api/auth/login', form.value)
    console.log(res.data)
    localStorage.setItem('token', res.data.token) // Stocker le token si besoin
    router.push('/')
  } catch (err) {
    console.error(err.response?.data || err.message)
    alert('Login failed')
  }
}
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.login-container {
  max-width: 400px;
  width: 100%;
  background: white;
  border-radius: 20px;
  padding: 2.5rem 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 1.875rem;
  font-weight: 600;
  color: #1e40af;
  margin-bottom: 0.5rem;
  text-align: left;
  line-height: 1.2;
}

.subtitle {
  color: #64748b;
  font-size: 1rem;
  margin-bottom: 2.5rem;
  text-align: left;
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

.input-field {
  padding: 1rem 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background-color: #f8fafc;
  color: #1e293b;
  transition: all 0.2s ease;
}

.input-field:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.input-field::placeholder {
  color: #94a3b8;
}

.forgot-password {
  text-align: right;
  margin-top: -0.5rem;
  margin-bottom: 0.5rem;
}

.forgot-link {
  color: #3b82f6;
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
  transition: color 0.2s ease;
}

.forgot-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.login-button {
  width: 100%;
  background-color: #1e40af;
  color: white;
  padding: 1.125rem;
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  margin-top: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.login-button:hover {
  background-color: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(30, 64, 175, 0.3);
}

.login-button:active {
  transform: translateY(0);
}

.register-link {
  text-align: center;
  color: #64748b;
  font-size: 0.95rem;
  margin-top: 2rem;
}

.link {
  color: #3b82f6;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

/* Animation d'entrée */
.login-container {
  animation: slideUp 0.4s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Responsive */
@media (max-width: 480px) {
  .login-page {
    padding: 0.5rem;
  }
  
  .login-container {
    padding: 2rem 1.5rem;
  }
  
  .title {
    font-size: 1.625rem;
  }
  
  .subtitle {
    font-size: 0.9rem;
  }
}

/* États de loading (optionnel) */
.login-button:disabled {
  background-color: #94a3b8;
  cursor: not-allowed;
  transform: none;
}

/* Focus visible pour l'accessibilité */
.login-button:focus-visible,
.input-field:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}
</style>
