<script setup lang="ts">
import { TIEMPO_POR_PREGUNTA_S, esNivel } from '@trivia/shared';
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

import BarraEstado from '../components/BarraEstado.vue';
import Cargando from '../components/Cargando.vue';
import ErrorCarga from '../components/ErrorCarga.vue';
import TarjetaPregunta from '../components/TarjetaPregunta.vue';
import { useCuentaRegresiva } from '../composables/useCuentaRegresiva';
import { usePartidaStore } from '../stores/partida';

const route = useRoute();
const router = useRouter();
const partida = usePartidaStore();

const cargando = ref(true);
const error = ref<{ titulo: string; mensaje: string } | null>(null);
const aviso = ref('');
const finPreguntaEn = ref(0);

function reiniciarReloj() {
  finPreguntaEn.value = Date.now() + TIEMPO_POR_PREGUNTA_S * 1000;
}

onMounted(async () => {
  const franquicia = String(route.params.franquicia);
  const nivel = String(route.params.nivel);

  if (!esNivel(nivel)) {
    error.value = { titulo: 'Nivel no válido:', mensaje: 'El nivel solicitado no existe. Elige Fácil, Intermedio o Experto.' };
    cargando.value = false;
    return;
  }
  try {
    await partida.iniciar(franquicia, nivel);
    if (partida.preguntas.length === 0) {
      error.value = { titulo: 'Sin preguntas:', mensaje: 'Esta franquicia todavía no tiene preguntas cargadas. Elige otra franquicia.' };
    } else {
      reiniciarReloj();
    }
  } catch {
    error.value = {
      titulo: 'Error de conexión:',
      mensaje: 'No se pudieron cargar las preguntas. Verifica que el servidor esté encendido (npm run dev:server) y vuelve a intentarlo.'
    };
  } finally {
    cargando.value = false;
  }
});

// El reloj corre solo mientras la pregunta sigue abierta
const abierta = computed(() => !cargando.value && !error.value && partida.preguntaActual !== null && partida.verificada === null);
const { segundos } = useCuentaRegresiva(finPreguntaEn, abierta);

// Al llegar a 0 sin haber respondido, se envía opcion null y el servidor la da por fallada
watch(segundos, (s) => {
  if (abierta.value && s <= 0) elegir(null);
});

async function elegir(opcion: string | null) {
  aviso.value = '';
  try {
    await partida.responder(opcion);
  } catch (e) {
    aviso.value = (e as Error).message;
  }
}

async function alSiguiente() {
  if (!partida.verificada) {
    aviso.value = 'Debes responder la pregunta actual para continuar.';
    return;
  }
  aviso.value = '';
  if (partida.esUltima) {
    await partida.terminar();
    router.push({ name: 'resultado' });
    return;
  }
  reiniciarReloj(); // antes de pasar de pregunta, para que el reloj nunca arranque en 0
  partida.siguiente();
}

const mensaje = computed(() => {
  if (aviso.value) return { texto: aviso.value, color: 'text-warning' };
  const verificada = partida.verificada;
  if (!verificada) return { texto: '', color: 'text-warning' };
  if (verificada.correcta) return { texto: '¡Respuesta correcta!', color: 'text-success' };
  return {
    texto:
      partida.seleccionada === null
        ? `Se acabó el tiempo. La respuesta era ${verificada.respuestaCorrecta}`
        : `Respuesta incorrecta. La respuesta era ${verificada.respuestaCorrecta}`,
    color: 'text-danger'
  };
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
