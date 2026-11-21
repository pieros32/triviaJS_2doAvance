<script setup lang="ts">
import { NOMBRES_NIVEL, type Nivel } from '@trivia/shared';
import { computed } from 'vue';

const props = defineProps<{
  jugador: string;
  nivel: Nivel;
  numero: number;
  total: number;
  puntaje: number;
  segundos: number;
  completadas: number;
}>();

const avance = computed(() => (props.total > 0 ? Math.round((props.completadas / props.total) * 100) : 0));
const urgente = computed(() => props.segundos <= 5);
</script>

<template>
  <section aria-live="polite" class="barra-estado barra-hud">
    <div class="row row-cols-2 row-cols-md-5 g-3 text-center text-md-start">
      <div class="col">
        <span class="etiqueta-estado d-block">Jugador</span>
        <span class="valor-estado valor-jugador">{{ jugador }}</span>
      </div>
      <div class="col">
        <span class="etiqueta-estado d-block">Nivel</span>
        <span class="valor-estado">{{ NOMBRES_NIVEL[nivel] }}</span>
      </div>
      <div class="col">
        <span class="etiqueta-estado d-block">Progreso</span>
        <span class="valor-estado">{{ numero }} / {{ total }}</span>
      </div>
      <div class="col">
        <span class="etiqueta-estado d-block">Puntaje</span>
        <span class="valor-estado">{{ puntaje }} pts</span>
      </div>
      <div class="col col-md-auto ms-md-auto">
        <span class="etiqueta-estado d-block">Tiempo</span>
        <span class="valor-estado valor-tiempo" :class="{ 'text-danger': urgente }">{{ segundos }} s</span>
      </div>
    </div>

    <div
      class="progress mt-3"
      role="progressbar"
      aria-label="Avance de la partida"
      :aria-valuenow="avance"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div class="progress-bar barra-avance" :style="{ width: `${avance}%` }"></div>
    </div>
  </section>
</template>
