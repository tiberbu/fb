import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'

// Import theme and styles in order
import './assets/themes/frappe-v15-theme.css'
import './assets/styles/buttons.css'
import './assets/styles/main.css'

// Import Font Awesome - local installation
import '@fortawesome/fontawesome-free/css/all.min.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialize auth store
const authStore = useAuthStore()
authStore.initializeAuth()

app.mount('#app')
