import { createApp } from 'vue'
import 'primeicons/primeicons.css'
import './style.css'
import App from './App.vue'
import PrimeVue from 'primevue/config';
import Aura from '@primeuix/themes/aura';

const app=createApp(App);
app.use(PrimeVue, {
  theme: {
    preset: Aura
  }
});
app.mount("#app");
window.app=App;