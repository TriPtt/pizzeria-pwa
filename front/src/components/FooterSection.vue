<template>
  <section class="footer-section">
    <div class="footer-card" :class="{ 'expanded': isExpanded }">
      <button 
        class="footer-expand-btn" 
        @click="toggleExpanded"
      >
        <div class="expand-btn-content">
          <i class="footer-icon ri-information-line"></i>
          <span class="expand-text">{{ buttonText }}</span>
        </div>
        <i 
          class="expand-arrow" 
          :class="isExpanded ? 'ri-arrow-up-s-line' : 'ri-arrow-down-s-line'"
        ></i>
      </button>
      
      <div class="footer-content" v-show="isExpanded">
        <div class="footer-grid">
          <div class="footer-col">
            <h4 class="footer-title">🍕 LA FAVOLA</h4>
            <p class="footer-description">
              Votre pizzeria authentique depuis {{ currentYear - startYear }} ans. 
              Des ingrédients frais, des recettes italiennes traditionnelles.
            </p>
            <div class="social-links">
              <a href="#" class="social-link facebook">
                <i class="ri-facebook-fill"></i>
              </a>
              <a href="#" class="social-link instagram">
                <i class="ri-instagram-line"></i>
              </a>
              <a href="#" class="social-link twitter">
                <i class="ri-twitter-fill"></i>
              </a>
            </div>
          </div>
          
          <div class="footer-col">
            <h4 class="footer-title">📍 Adresse</h4>
            <div class="contact-info">
              <div class="contact-item">
                <i class="ri-map-pin-line"></i>
                <span>{{ address }}</span>
              </div>
              <div class="contact-item">
                <i class="ri-phone-line"></i>
                <a :href="`tel:${phone}`">{{ phone }}</a>
              </div>
              <div class="contact-item">
                <i class="ri-mail-line"></i>
                <a :href="`mailto:${email}`">{{ email }}</a>
              </div>
            </div>
          </div>
          
          <div class="footer-col">
            <h4 class="footer-title">🕒 Horaires</h4>
            <div class="hours-list">
              <div 
                v-for="(hours, day) in openingHours" 
                :key="day"
                class="hours-item"
                :class="{ 'today': isToday(day) }"
              >
                <span class="day">{{ formatDay(day) }}</span>
                <span class="hours">{{ hours }}</span>
              </div>
            </div>
          </div>
          
          <div class="footer-col">
            <h4 class="footer-title">🔗 Liens</h4>
            <nav class="footer-nav">
              <a href="#" class="footer-link">Mentions légales</a>
              <a href="#" class="footer-link">CGV</a>
              <a href="#" class="footer-link">Politique de confidentialité</a>
              <a href="#" class="footer-link">Contact</a>
              <a href="#" class="footer-link">Allergènes</a>
            </nav>
          </div>
        </div>
        
        <div class="footer-bottom">
          <p class="copyright">
            © {{ currentYear }} LA FAVOLA. Tous droits réservés. 
            <span class="made-with">Fait avec ❤️ à {{ city }}</span>
          </p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  buttonText: {
    type: String,
    default: 'En savoir plus sur LA FAVOLA'
  },
  address: {
    type: String,
    default: '123 Rue de la Pizza, 75001 Paris'
  },
  phone: {
    type: String,
    default: '01 23 45 67 89'
  },
  email: {
    type: String,
    default: 'contact@lafavola.fr'
  },
  city: {
    type: String,
    default: 'Paris'
  },
  startYear: {
    type: Number,
    default: 2010
  },
  openingHours: {
    type: Object,
    default: () => ({
      lundi: '11h30 - 14h30, 18h30 - 22h30',
      mardi: '11h30 - 14h30, 18h30 - 22h30', 
      mercredi: '11h30 - 14h30, 18h30 - 22h30',
      jeudi: '11h30 - 14h30, 18h30 - 22h30',
      vendredi: '11h30 - 14h30, 18h30 - 23h00',
      samedi: '11h30 - 23h00',
      dimanche: '11h30 - 22h00'
    })
  },
  defaultExpanded: {
    type: Boolean,
    default: false
  }
})

// État
const isExpanded = ref(props.defaultExpanded)

// Computed
const currentYear = computed(() => new Date().getFullYear())

const currentDay = computed(() => {
  const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi']
  return days[new Date().getDay()]
})

// Méthodes
const toggleExpanded = () => {
  isExpanded.value = !isExpanded.value
}

const formatDay = (day) => {
  return day.charAt(0).toUpperCase() + day.slice(1)
}

const isToday = (day) => {
  return day === currentDay.value
}
</script>

<style scoped>
.footer-section {
  padding: 1rem;
  margin-top: 2rem;
}

.footer-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.footer-card.expanded {
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
}

.footer-expand-btn {
  width: 100%;
  background: none;
  border: none;
  padding: 1.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 500;
  color: #374151;
  transition: all 0.2s;
  font-size: 1rem;
}

.footer-expand-btn:hover {
  background-color: #f9fafb;
}

.expand-btn-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.footer-icon {
  font-size: 1.2rem;
  color: #4f46e5;
}

.expand-arrow {
  font-size: 1.2rem;
  transition: transform 0.3s ease;
}

.footer-content {
  padding: 0 1.25rem 1.25rem;
  border-top: 1px solid #f3f4f6;
}

.footer-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-col {
  min-width: 0;
}

.footer-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 1rem 0;
}

.footer-description {
  color: #6b7280;
  line-height: 1.6;
  margin: 0 0 1rem 0;
  font-size: 0.95rem;
}

.social-links {
  display: flex;
  gap: 0.5rem;
}

.social-link {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  color: white;
  font-size: 1.1rem;
  transition: transform 0.2s;
}

.social-link:hover {
  transform: translateY(-2px);
}

.social-link.facebook { background: #1877f2; }
.social-link.instagram { background: linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%); }
.social-link.twitter { background: #1da1f2; }

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #6b7280;
  font-size: 0.95rem;
}

.contact-item i {
  color: #4f46e5;
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.contact-item a {
  color: inherit;
  text-decoration: none;
  transition: color 0.2s;
}

.contact-item a:hover {
  color: #4f46e5;
}

.hours-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.hours-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  border-radius: 8px;
  font-size: 0.9rem;
  transition: background-color 0.2s;
}

.hours-item.today {
  background: #eff6ff;
  border: 1px solid #dbeafe;
  font-weight: 500;
}

.hours-item .day {
  color: #374151;
  font-weight: 500;
}

.hours-item .hours {
  color: #6b7280;
  font-size: 0.85rem;
}

.hours-item.today .day,
.hours-item.today .hours {
  color: #1d4ed8;
}

.footer-nav {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.footer-link {
  color: #6b7280;
  text-decoration: none;
  font-size: 0.9rem;
  padding: 0.5rem 0;
  transition: color 0.2s;
}

.footer-link:hover {
  color: #4f46e5;
}

.footer-bottom {
  padding-top: 1.5rem;
  border-top: 1px solid #f3f4f6;
}

.copyright {
  text-align: center;
  color: #9ca3af;
  font-size: 0.85rem;
  margin: 0;
  line-height: 1.6;
}

.made-with {
  display: block;
  margin-top: 0.25rem;
}

/* Responsive */
@media (max-width: 768px) {
  .footer-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .hours-item {
    font-size: 0.85rem;
  }
  
  .copyright {
    font-size: 0.8rem;
  }
}
</style>
