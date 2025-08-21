<template>
  <div class="contact-page">
    <!-- Header -->
    <div class="contact-header">
      <button @click="$router.go(-1)" class="back-btn">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 5l-7 7 7 7" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
      <h1>Nous contacter</h1>
    </div>

    <div class="contact-content">
      <!-- Section héro -->
      <div class="hero-section">
        <div class="hero-content">
          <h2>Une question ? Une envie ?</h2>
          <p>Nous sommes là pour vous ! Contactez-nous et nous vous répondrons dans les plus brefs délais.</p>
        </div>
      </div>

      <!-- Infos de contact rapides -->
      <div class="quick-contact">
        <div class="contact-card" @click="openPhone">
          <div class="contact-icon phone">
            <i class="ri-phone-line"></i>
          </div>
          <div class="contact-info">
            <h3>Appelez-nous</h3>
            <p>07 44 52 57 77</p>
            <span class="contact-status">Réponse immédiate</span>
          </div>
          <i class="ri-arrow-right-line"></i>
        </div>

        <div class="contact-card" @click="openEmail">
          <div class="contact-icon email">
            <i class="ri-mail-line"></i>
          </div>
          <div class="contact-info">
            <h3>Écrivez-nous</h3>
            <p>lafavola17@gmail.com</p>
            <span class="contact-status">Réponse sous 24h</span>
          </div>
          <i class="ri-arrow-right-line"></i>
        </div>

        <div class="contact-card" @click="openMaps">
          <div class="contact-icon location">
            <i class="ri-map-pin-line"></i>
          </div>
          <div class="contact-info">
            <h3>Rendez-vous</h3>
            <p>39 Rue Gambetta</p>
            <span class="contact-status">Saint-Jean-d'Angély</span>
          </div>
          <i class="ri-arrow-right-line"></i>
        </div>
      </div>

      <!-- Formulaire de contact -->
      <div class="contact-form-section">
        <h3>Laissez-nous un message</h3>
        <p class="form-description">
          Vous préférez écrire ? Remplissez ce formulaire et nous vous contacterons rapidement.
        </p>

        <form @submit.prevent="handleSubmit" class="contact-form">
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">Prénom *</label>
              <input 
                id="firstName"
                v-model="form.firstName" 
                type="text" 
                required 
                placeholder="Votre prénom"
              >
            </div>
            <div class="form-group">
              <label for="lastName">Nom *</label>
              <input 
                id="lastName"
                v-model="form.lastName" 
                type="text" 
                required 
                placeholder="Votre nom"
              >
            </div>
          </div>

          <div class="form-group">
            <label for="email">Email *</label>
            <input 
              id="email"
              v-model="form.email" 
              type="email" 
              required 
              placeholder="votre.email@exemple.com"
            >
          </div>

          <div class="form-group">
            <label for="phone">Téléphone</label>
            <input 
              id="phone"
              v-model="form.phone" 
              type="tel" 
              placeholder="06 12 34 56 78"
            >
          </div>

          <div class="form-group">
            <label for="subject">Sujet *</label>
            <select id="subject" v-model="form.subject" required>
              <option value="">Choisissez un sujet</option>
              <option value="commande">Question sur une commande</option>
              <option value="reservation">Réservation de table</option>
              <option value="livraison">Livraison</option>
              <option value="allergenes">Allergènes et ingrédients</option>
              <option value="feedback">Avis et suggestions</option>
              <option value="autre">Autre</option>
            </select>
          </div>

          <div class="form-group">
            <label for="message">Message *</label>
            <textarea 
              id="message"
              v-model="form.message" 
              required 
              placeholder="Décrivez votre demande en détail..."
              rows="5"
            ></textarea>
            <span class="char-count">{{ form.message.length }}/500</span>
          </div>

          <button 
            type="submit" 
            class="submit-btn"
            :disabled="isSubmitting"
          >
            <i class="ri-send-plane-line"></i>
            {{ isSubmitting ? 'Envoi en cours...' : 'Envoyer le message' }}
          </button>
        </form>

        <div v-if="submitStatus" class="submit-message" :class="submitStatus">
          <i :class="submitStatus === 'success' ? 'ri-check-line' : 'ri-error-warning-line'"></i>
          <span v-if="submitStatus === 'success'">
            Message envoyé ! Nous vous répondrons rapidement.
          </span>
          <span v-else>
            Une erreur est survenue. Veuillez réessayer ou nous contacter directement.
          </span>
        </div>
      </div>

      <!-- Informations détaillées -->
      <div class="detailed-info">
        <div class="info-section">
          <h3>Notre restaurant</h3>
          <div class="info-content">
            <div class="info-item">
              <i class="ri-map-pin-line"></i>
              <div>
                <strong>Adresse complète</strong>
                <p>39 Rue Gambetta<br>17400 Saint-Jean-d'Angély<br>Charente-Maritime</p>
              </div>
            </div>
            <div class="info-item">
              <i class="ri-car-line"></i>
              <div>
                <strong>Parking</strong>
                <p>Places disponibles à proximité<br>Accès facile en centre-ville</p>
              </div>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h3>Nos horaires</h3>
          <div class="hours-grid">
            <div 
              v-for="(hours, day) in openingHours" 
              :key="day"
              class="hours-item"
              :class="{ 'today': isToday(day) }"
            >
              <span class="day">{{ formatDay(day) }}</span>
              <span class="hours" :class="{ 'closed': hours === 'Fermé' }">{{ hours }}</span>
            </div>
          </div>
        </div>

        <div class="info-section">
          <h3>Nos services</h3>
          <div class="services-grid">
            <div class="service-item">
              <i class="ri-restaurant-line"></i>
              <div>
                <strong>Sur place</strong>
                <p>Dégustez dans notre restaurant</p>
              </div>
            </div>
            <div class="service-item">
              <i class="ri-takeaway-line"></i>
              <div>
                <strong>À emporter</strong>
                <p>Commandez et venez récupérer</p>
              </div>
            </div>
            <div class="service-item">
              <i class="ri-calendar-line"></i>
              <div>
                <strong>Réservations</strong>
                <p>Tables disponibles sur demande</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Réseaux sociaux -->
      <div class="social-section">
        <h3>Suivez-nous</h3>
        <p>Restez connectés pour nos nouveautés et offres spéciales</p>
        <div class="social-links">
          <a href="https://www.facebook.com/people/La-Favola/61565671874103/" class="social-link facebook">
            <i class="ri-facebook-fill"></i>
            <span>Facebook</span>
          </a>
          <a href="https://www.instagram.com/_la_favola_/" class="social-link instagram">
            <i class="ri-instagram-line"></i>
            <span>Instagram</span>
          </a>
        </div>
      </div>

      <!-- FAQ rapide -->
      <div class="faq-section">
        <h3>Questions fréquentes</h3>
        <div class="faq-list">
          <div 
            v-for="(faq, index) in faqs" 
            :key="index"
            class="faq-item"
            @click="faq.open = !faq.open"
          >
            <div class="faq-question">
              <span>{{ faq.question }}</span>
              <i :class="faq.open ? 'ri-subtract-line' : 'ri-add-line'"></i>
            </div>
            <div v-show="faq.open" class="faq-answer">
              <p>{{ faq.answer }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

// Formulaire de contact
const form = reactive({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  subject: '',
  message: '',
  newsletter: false
})

const isSubmitting = ref(false)
const submitStatus = ref(null) // 'success' | 'error' | null

// Horaires d'ouverture
const openingHours = {
      lundi: 'Fermé',
      mardi: '18h30 - 21h30', 
      mercredi: '18h30 - 21h30',
      jeudi: '11h30 - 13h30 / 18h30 - 21h30',
      vendredi: '18h00 - 22h00',
      samedi: '18h00 - 22h00',
      dimanche: '18h30 - 21h30'
}

// FAQ
const faqs = ref([
  {
    question: "Proposez-vous des options végétariennes ?",
    answer: "Absolument ! Nous avons plusieurs pizzas végétariennes et pouvons adapter la plupart de nos recettes selon vos préférences.",
    open: false
  },
  {
    question: "Acceptez-vous les tickets restaurant ?",
    answer: "Oui, nous acceptons les tickets restaurant pour les repas sur place et à emporter.",
    open: false
  },
  {
    question: "Avez-vous des informations sur les allergènes ?",
    answer: "Toutes les informations sur les allergènes sont disponibles sur demande. N'hésitez pas à nous contacter pour toute question spécifique.",
    open: false
  }
])

// Méthodes
const handleSubmit = async () => {
  isSubmitting.value = true
  submitStatus.value = null
  
  try {
    // Simulation d'envoi par email (mailto)
    const subject = encodeURIComponent(`Contact LA FAVOLA - ${form.subject}`)
    const body = encodeURIComponent(
      `Bonjour,

Nouveau message de contact depuis le site web :

Nom : ${form.firstName} ${form.lastName}
Email : ${form.email}
Téléphone : ${form.phone || 'Non renseigné'}
Sujet : ${form.subject}

Message :
${form.message}

Newsletter : ${form.newsletter ? 'Oui' : 'Non'}

---
Envoyé depuis le formulaire de contact de LA FAVOLA`
    )
    
    // Ouvrir le client email par défaut
    window.location.href = `mailto:lafavola17@gmail.com?subject=${subject}&body=${body}`
    
    // Simuler un délai et afficher le succès
    setTimeout(() => {
      submitStatus.value = 'success'
      resetForm()
      isSubmitting.value = false
    }, 1000)
    
  } catch (error) {
    submitStatus.value = 'error'
    isSubmitting.value = false
  }
}

const resetForm = () => {
  Object.keys(form).forEach(key => {
    if (key === 'newsletter') {
      form[key] = false
    } else {
      form[key] = ''
    }
  })
}

const openPhone = () => {
  window.location.href = 'tel:0744525777'
}

const openEmail = () => {
  window.location.href = 'mailto:lafavola17@gmail.com'
}

const openMaps = () => {
  const address = encodeURIComponent('39 Rue Gambetta, 17400 Saint-Jean-d\'Angély')
  window.open(`https://www.google.com/maps/search/?api=1&query=${address}`, '_blank')
}

const isToday = (day) => {
  const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
  const today = new Date().getDay()
  return days[today] === day
}

const formatDay = (day) => {
  return day.charAt(0).toUpperCase() + day.slice(1)
}
</script>

<style scoped>
.contact-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding-bottom: 140px;
}

/* Header */
.contact-header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: white;
  border-bottom: 1px solid #eee;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.back-btn {
  background: none;
  border: none;
  padding: 8px;
  cursor: pointer;
  color: #666;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.back-btn:hover {
  background: #f0f0f0;
}

.contact-header h1 {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* Hero Section */
.hero-section {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 40px 20px;
  margin: 20px 0;
  border-radius: 16px;
  text-align: center;
}

.hero-content h2 {
  font-size: 24px;
  margin: 0 0 12px;
  font-weight: 700;
}

.hero-content p {
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  line-height: 1.6;
}

/* Quick Contact */
.quick-contact {
  display: grid;
  gap: 16px;
  margin: 32px 0;
}

.contact-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.contact-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
}

.contact-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: white;
}

.contact-icon.phone { background: #10b981; }
.contact-icon.email { background: #3b82f6; }
.contact-icon.location { background: #f59e0b; }

.contact-info {
  flex: 1;
}

.contact-info h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px;
  color: #333;
}

.contact-info p {
  font-size: 14px;
  color: #666;
  margin: 0 0 4px;
}

.contact-status {
  font-size: 12px;
  color: #10b981;
  font-weight: 500;
}

/* Formulaire */
.contact-form-section {
  background: white;
  padding: 24px;
  border-radius: 16px;
  margin: 32px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.contact-form-section h3 {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px;
  color: #333;
}

.form-description {
  color: #666;
  margin: 0 0 24px;
  line-height: 1.6;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 90%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.char-count {
  font-size: 12px;
  color: #999;
  text-align: right;
  margin-top: 4px;
}

.checkbox-group {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1.5;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  margin: 0;
}

.submit-btn {
  width: 100%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.4);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.submit-message {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.submit-message.success {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #a7f3d0;
}

.submit-message.error {
  background: #fef2f2;
  color: #991b1b;
  border: 1px solid #fecaca;
}

/* Infos détaillées */
.detailed-info {
  display: grid;
  gap: 20px;
  margin: 32px 0;
}

.info-section {
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.info-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px;
  color: #333;
}

.info-content {
  display: grid;
  gap: 16px;
}

.info-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.info-item i {
  font-size: 20px;
  color: #3b82f6;
  margin-top: 2px;
}

.info-item strong {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.info-item p {
  color: #666;
  margin: 0;
  line-height: 1.5;
}

/* Horaires */
.hours-grid {
  display: grid;
  gap: 8px;
}

.hours-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  transition: background-color 0.2s;
}

.hours-item.today {
  background: #eff6ff;
  border: 1px solid #dbeafe;
}

.hours-item .day {
  font-weight: 500;
  color: #333;
}

.hours-item .hours {
  color: #666;
  font-size: 14px;
}

.hours-item.today .day,
.hours-item.today .hours {
  color: #1d4ed8;
}

.hours-item .hours.closed {
  color: #dc2626;
}

/* Services */
.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.service-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid #f3f4f6;
  border-radius: 8px;
  transition: all 0.2s;
}

.service-item:hover {
  border-color: #e5e7eb;
  background: #f9fafb;
}

.service-item i {
  font-size: 24px;
  color: #3b82f6;
}

.service-item strong {
  display: block;
  font-weight: 600;
  color: #333;
  margin-bottom: 4px;
}

.service-item p {
  color: #666;
  margin: 0;
  font-size: 14px;
}

/* Réseaux sociaux */
.social-section {
  background: white;
  padding: 24px;
  border-radius: 16px;
  margin: 32px 0;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.social-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px;
  color: #333;
}

.social-section p {
  color: #666;
  margin: 0 0 20px;
}

.social-links {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.social-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  border-radius: 25px;
  text-decoration: none;
  color: white;
  font-weight: 500;
  transition: transform 0.2s;
}

.social-link:hover {
  transform: translateY(-2px);
}

.social-link.facebook { background: #1877f2; }
.social-link.instagram { background: linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%); }
.social-link.twitter { background: #1da1f2; }

/* FAQ */
.faq-section {
  background: white;
  padding: 24px;
  border-radius: 16px;
  margin: 32px 0;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.faq-section h3 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px;
  color: #333;
}

.faq-list {
  display: grid;
  gap: 12px;
}

.faq-item {
  border: 1px solid #f3f4f6;
  border-radius: 8px;
  overflow: hidden;
  transition: border-color 0.2s;
}

.faq-item:hover {
  border-color: #e5e7eb;
}

.faq-question {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  font-weight: 500;
  color: #333;
}

.faq-answer {
  padding: 0 16px 16px;
  color: #666;
  line-height: 1.6;
}

.faq-answer p {
  margin: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .services-grid {
    grid-template-columns: 1fr;
  }
  
  .social-links {
    flex-direction: column;
    align-items: center;
  }
  
  .social-link {
    width: 200px;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .contact-content {
    padding: 0 12px;
  }
  
  .hero-section {
    margin: 16px 0;
    padding: 32px 16px;
  }
  
  .contact-form-section,
  .info-section,
  .social-section,
  .faq-section {
    padding: 20px;
  }
}
</style>