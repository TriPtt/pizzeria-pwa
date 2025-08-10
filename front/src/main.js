import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import 'remixicon/fonts/remixicon.css'
import './styles/animation.css'

const app = createApp(App)

const pinia = createPinia()

app.use(pinia)

import { useAuthStore } from './stores/authStore'
const authStore = useAuthStore()
authStore.initAuth()

app.use(router)


app.mount('#app')
