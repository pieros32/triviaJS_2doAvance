<script lang="ts">
import type { PreguntaPublica } from '@trivia/shared';
import { defineComponent, type PropType } from 'vue';

import { urlImagen } from '../services/api';

export default defineComponent({
  name: 'TarjetaPregunta',
  props: {
    pregunta: { type: Object as PropType<PreguntaPublica>, required: true },
    seleccionada: { type: String as PropType<string | null>, default: null },
    /** Respuesta correcta; es null mientras la pregunta sigue abierta. */
    correcta: { type: String as PropType<string | null>, default: null },
    bloqueada: { type: Boolean, required: true },
    mensaje: { type: String, required: true },
    colorMensaje: { type: String, required: true },
    esUltima: { type: Boolean, required: true }
  },
  emits: ['elegir', 'siguiente'],
  computed: {
    // Sin imagen ni tipo no se dibuja la columna visual
    tieneVisual(): boolean {
      return Boolean(this.pregunta.imagen || this.pregunta.tipo);
    }
  },
  methods: {
    urlImagen,
    clasesOpcion(opcion: string) {
      const revelada = this.correcta !== null;
      return {
        correcta: revelada && opcion === this.correcta,
        incorrecta: revelada && opcion === this.seleccionada && opcion !== this.correcta
      };
    }
  }
});
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
