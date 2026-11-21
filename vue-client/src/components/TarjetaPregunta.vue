<script setup lang="ts">
import type { PreguntaPublica } from '@trivia/shared';
import { computed } from 'vue';

import { urlImagen } from '../services/api';

const props = defineProps<{
  pregunta: PreguntaPublica;
  seleccionada: string | null;
  /** Respuesta correcta; es null mientras la pregunta sigue abierta. */
  correcta: string | null;
  bloqueada: boolean;
  mensaje: string;
  colorMensaje: string;
  esUltima: boolean;
}>();

defineEmits<{ elegir: [opcion: string]; siguiente: [] }>();

// Sin imagen ni tipo no se dibuja la columna visual
const tieneVisual = computed(() => Boolean(props.pregunta.imagen || props.pregunta.tipo));

function clasesOpcion(opcion: string) {
  const revelada = props.correcta !== null;
  return {
    correcta: revelada && opcion === props.correcta,
    incorrecta: revelada && opcion === props.seleccionada && opcion !== props.correcta
  };
}
</script>

<template>
  <article class="tarjeta-trivia arena-cuestionario" :class="{ 'sin-visual': !tieneVisual }">
    <div v-if="tieneVisual" class="col-visual-trivia">
      <div v-if="pregunta.tipo" class="insignia-categoria" id="tipoPregunta">{{ pregunta.tipo }}</div>
      <div v-if="pregunta.imagen" class="marco-imagen">
        <img alt="Imagen representativa de la pregunta" id="imagenPregunta" :src="urlImagen(pregunta.imagen)" />
      </div>
    </div>

    <div class="col-contenido-trivia">
      <h2 id="pregunta">{{ pregunta.pregunta }}</h2>

      <div id="opciones" role="group" aria-label="Opciones de respuesta">
        <button
          v-for="opcion in pregunta.opciones"
          :key="opcion"
          type="button"
          class="opcion-btn"
          :class="clasesOpcion(opcion)"
          :disabled="bloqueada"
          @click="$emit('elegir', opcion)"
        >
          {{ opcion }}
        </button>
      </div>

      <div aria-live="assertive" id="resultado" :class="colorMensaje">{{ mensaje }}</div>

      <button id="siguiente" type="button" @click="$emit('siguiente')">
        <span>{{ esUltima ? 'Ver resultado' : 'Siguiente Pregunta' }}</span>
        <svg fill="none" height="22" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" width="22">
          <line x1="5" x2="19" y1="12" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </button>
    </div>
  </article>
</template>
