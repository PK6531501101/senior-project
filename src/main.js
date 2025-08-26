// main.js
import { createApp } from 'vue';
import App from './App.vue';
import router from './Router/router';
import './Assets/main.css'

createApp(App).use(router).mount('#app');