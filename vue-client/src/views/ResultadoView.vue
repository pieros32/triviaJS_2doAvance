<script setup lang="ts">
import { NOMBRES_NIVEL } from '@trivia/shared';
import { computed } from 'vue';

import { usePartidaStore } from '../stores/partida';

const partida = usePartidaStore();

const total = computed(() => partida.preguntas.length);
const porcentaje = computed(() => (total.value > 0 ? Math.round((partida.puntaje / total.value) * 100) : 0));
const colorBarra = computed(() => (porcentaje.value >= 70 ? 'bg-success' : porcentaje.value >= 40 ? 'bg-warning' : 'bg-danger'));
</script>

<template>
  <div v-if="partida.nivel" class="pantalla">
    <article class="tarjeta-trivia tarjeta-resultado">
      <div class="col-contenido-trivia">
        <div class="insignia-categoria" id="tipoPregunta">RESULTADO</div>
        <h2 id="pregunta">{{ partida.jugador }}, terminaste el nivel {{ NOMBRES_NIVEL[partida.nivel] }}</h2>
        <span class="badge text-bg-secondary fs-6">{{ partida.franquiciaNombre }}</span>

        <div aria-live="polite" id="resultado">
          Obtuviste {{ partida.puntaje }} de {{ total }} puntos ({{ porcentaje }}%)
        </div>

        <div
          class="progress w-100"
          role="progressbar"
          aria-label="Porcentaje de aciertos"
          :aria-valuenow="porcentaje"
          aria-valuemin="0"
          aria-valuemax="100"
        >
          <div class="progress-bar" :class="colorBarra" :style="{ width: `${porcentaje}%` }"></div>
        </div>

        <p v-if="partida.guardado === 'ok'" class="texto-ranking mb-0">Tu partida quedó guardada en el ranking.</p>
        <p v-else-if="partida.guardado === 'guardando'" class="texto-ranking mb-0">Guardando en el ranking…</p>
        <div v-else-if="partida.guardado === 'error'" class="alert alert-warning mb-0" role="alert">
          No se pudo guardar en el ranking.
          <button type="button" class="btn btn-sm btn-outline-warning ms-2" @click="partida.guardar()">Reintentar</button>
        </div>

        <div class="acciones-resultado">
          <RouterLink class="btn-accion" :to="{ name: 'juego', params: { franquicia: partida.franquicia, nivel: partida.nivel } }">
            Jugar de nuevo
          </RouterLink>
          <RouterLink class="btn-accion btn-secundario" :to="{ name: 'inicio' }">Elegir otro nivel</RouterLink>
          <RouterLink class="btn-accion btn-secundario" :to="{ name: 'ranking' }">Ver ranking</RouterLink>
        </div>
      </div>
    </article>
  </div>
</template>
