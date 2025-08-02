<template>
  <div class="register-page">
    <div class="register-container">
      <h2 class="title">Créer ton compte</h2>
      
      <form @submit.prevent="handleRegister" class="form">
        <div class="input-group">
          <input
            v-model="form.name"
            type="text"
            placeholder="Nom complet"
            class="input-field"
            required 
          />
        </div>
        
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
          <div class="phone-container">
            <div class="country-code">+33</div>
            <input
              v-model="form.phone"
              type="tel"
              placeholder="Numéro de téléphone"
              class="phone-input"
              required 
            />
          </div>
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
        
        <button type="submit" class="register-button">
          Créer un compte
        </button>
      </form>
      
      <p class="login-link">
        Déjà inscrit ?
        <router-link to="/login" class="link">Se connecter</router-link>
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
  name: '',
  email: '',
  phone: '',
  password: ''
})

const api = import.meta.env.VITE_API_URL_BACK 

const handleRegister = async () => {
  try {
    const res = await axios.post(`${api}/api/auth/register`, form.value)
    console.log(res.data)
    router.push('/login')
  } catch (err) {
    console.error(err.response?.data || err.message)
    alert('Registration failed')
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.register-container {
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
  margin-bottom: 2.5rem;
  text-align: left;
  line-height: 1.2;
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

.phone-container {
  display: flex;
  gap: 0.75rem;
}

.country-code {
  background-color: #f1f5f9;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 1rem;
  font-weight: 600;
  color: #64748b;
  min-width: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
}

.phone-input {
  flex: 1;
  padding: 1rem 1.25rem;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 1rem;
  background-color: #f8fafc;
  color: #1e293b;
  transition: all 0.2s ease;
}

.phone-input:focus {
  outline: none;
  border-color: #3b82f6;
  background-color: white;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.phone-input::placeholder {
  color: #94a3b8;
}

.register-button {
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

.register-button:hover {
  background-color: #1d4ed8;
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(30, 64, 175, 0.3);
}

.register-button:active {
  transform: translateY(0);
}

.login-link {
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
.register-container {
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
  .register-page {
    padding: 0.5rem;
  }
  
  .register-container {
    padding: 2rem 1.5rem;
  }
  
  .title {
    font-size: 1.625rem;
  }
}
</style>
