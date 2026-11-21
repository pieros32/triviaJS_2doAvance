import 'bootstrap/dist/css/bootstrap.min.css';
import '@trivia/shared/estilos';

import { createPinia } from 'pinia';
import { createApp } from 'vue';

import App from './App.vue';
import { router } from './router';

createApp(App).use(createPinia()).use(router).mount('#root');
