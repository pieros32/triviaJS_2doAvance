import { createRouter, createWebHistory } from 'vue-router';

import { usePartidaStore } from '../stores/partida';
import InicioView from '../views/InicioView.vue';

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'inicio', component: InicioView },
    {
      path: '/jugar/:franquicia/:nivel',
      name: 'juego',
      component: () => import('../views/JuegoView.vue'),
      // Sin pasar por el formulario (por ejemplo al recargar) no hay jugador: se vuelve al inicio
      beforeEnter: () => (usePartidaStore().jugador ? true : { name: 'inicio' })
    },
    {
      path: '/resultado',
      name: 'resultado',
      component: () => import('../views/ResultadoView.vue'),
      beforeEnter: () => (usePartidaStore().terminada ? true : { name: 'inicio' })
    },
    { path: '/ranking', name: 'ranking', component: () => import('../views/RankingView.vue') },
    { path: '/:pathMatch(.*)*', name: 'no-encontrada', component: () => import('../views/NoEncontradaView.vue') }
  ]
});
