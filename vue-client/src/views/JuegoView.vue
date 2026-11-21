<script lang="ts">
import { TIEMPO_POR_PREGUNTA_S, esNivel } from '@trivia/shared';
import { defineComponent } from 'vue';

import BarraEstado from '../components/BarraEstado.vue';
import Cargando from '../components/Cargando.vue';
import ErrorCarga from '../components/ErrorCarga.vue';
import TarjetaPregunta from '../components/TarjetaPregunta.vue';
import { usePartidaStore } from '../stores/partida';

export default defineComponent({
  name: 'JuegoView',
  components: { BarraEstado, Cargando, ErrorCarga, TarjetaPregunta },
  data() {
    return {
      cargando: true,
      error: null as { titulo: string; mensaje: string } | null,
      aviso: '',
      finPreguntaEn: 0, // marca de tiempo (ms) en la que se acaba la pregunta
      ahora: Date.now(),
      intervalo: 0
    };
  },
  computed: {
    partida() {
      return usePartidaStore();
    },
    // El reloj corre solo mientras la pregunta sigue abierta
    abierta(): boolean {
      return !this.cargando && !this.error && this.partida.preguntaActual !== null && this.partida.verificada === null;
    },
    segundos(): number {
      return Math.max(Math.ceil((this.finPreguntaEn - this.ahora) / 1000), 0);
    },
    mensaje(): { texto: string; color: string } {
      if (this.aviso) return { texto: this.aviso, color: 'text-warning' };
      const verificada = this.partida.verificada;
      if (!verificada) return { texto: '', color: 'text-warning' };
      if (verificada.correcta) return { texto: '¡Respuesta correcta!', color: 'text-success' };
      return {
        texto:
          this.partida.seleccionada === null
            ? `Se acabó el tiempo. La respuesta era ${verificada.respuestaCorrecta}`
            : `Respuesta incorrecta. La respuesta era ${verificada.respuestaCorrecta}`,
        color: 'text-danger'
      };
    }
  },
  watch: {
    // Arranca o detiene el reloj según haya una pregunta abierta
    abierta: {
      handler(activa: boolean) {
        this.detenerReloj();
        if (activa) {
          this.ahora = Date.now();
          this.intervalo = window.setInterval(() => (this.ahora = Date.now()), 250);
        }
      },
      immediate: true
    },
    // Al llegar a 0 sin haber respondido, se envía opcion null y el servidor la da por fallada
    segundos(nuevo: number) {
      if (this.abierta && nuevo <= 0) this.elegir(null);
    }
  },
  async mounted() {
    const franquicia = String(this.$route.params.franquicia);
    const nivel = String(this.$route.params.nivel);

    if (!esNivel(nivel)) {
      this.error = { titulo: 'Nivel no válido:', mensaje: 'El nivel solicitado no existe. Elige Fácil, Intermedio o Experto.' };
      this.cargando = false;
      return;
    }
    try {
      await this.partida.iniciar(franquicia, nivel);
      if (this.partida.preguntas.length === 0) {
        this.error = { titulo: 'Sin preguntas:', mensaje: 'Esta franquicia todavía no tiene preguntas cargadas. Elige otra franquicia.' };
      } else {
        this.reiniciarReloj();
      }
    } catch {
      this.error = {
        titulo: 'Error de conexión:',
        mensaje: 'No se pudieron cargar las preguntas. Verifica que el servidor esté encendido (npm run dev:server) y vuelve a intentarlo.'
      };
    } finally {
      this.cargando = false;
    }
  },
  beforeUnmount() {
    this.detenerReloj(); // sin esto el intervalo seguiría vivo al salir de la pantalla
  },
  methods: {
    reiniciarReloj() {
      this.finPreguntaEn = Date.now() + TIEMPO_POR_PREGUNTA_S * 1000;
    },
    detenerReloj() {
      window.clearInterval(this.intervalo);
      this.intervalo = 0;
    },
    async elegir(opcion: string | null) {
      this.aviso = '';
      try {
        await this.partida.responder(opcion);
      } catch (e) {
        this.aviso = (e as Error).message;
      }
    },
    async alSiguiente() {
      if (!this.partida.verificada) {
        this.aviso = 'Debes responder la pregunta actual para continuar.';
        return;
      }
      this.aviso = '';
      if (this.partida.esUltima) {
        await this.partida.terminar();
        this.$router.push({ name: 'resultado' });
        return;
      }
      this.reiniciarReloj(); // antes de pasar de pregunta, para que el reloj nunca arranque en 0
      this.partida.siguiente();
    }
  }
});
</script>

<template>
  <Cargando v-if="cargando" texto="Cargando preguntas…" />

  <div v-else-if="error" class="pantalla">
    <ErrorCarga :titulo="error.titulo" :mensaje="error.mensaje" />
    <RouterLink class="btn-accion btn-secundario" :to="{ name: 'inicio' }">Volver al inicio</RouterLink>
  </div>

  <div v-else-if="partida.preguntaActual && partida.nivel" class="pantalla">
    <BarraEstado
      :jugador="partida.jugador"
      :nivel="partida.nivel"
      :numero="partida.indice + 1"
      :total="partida.preguntas.length"
      :puntaje="partida.puntaje"
      :segundos="abierta ? segundos : 0"
      :completadas="partida.indice + (partida.verificada ? 1 : 0)"
    />

    <TarjetaPregunta
      :pregunta="partida.preguntaActual"
      :seleccionada="partida.seleccionada"
      :correcta="partida.verificada?.respuestaCorrecta ?? null"
      :bloqueada="partida.verificada !== null || partida.respondiendo"
      :mensaje="mensaje.texto"
      :color-mensaje="mensaje.color"
      :es-ultima="partida.esUltima"
      @elegir="elegir"
      @siguiente="alSiguiente"
    />
  </div>
</template>
