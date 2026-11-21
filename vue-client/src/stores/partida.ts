import type { Nivel, PreguntaPublica, RespuestaVerificada } from '@trivia/shared';
import { defineStore } from 'pinia';
import { computed, ref } from 'vue';

import { guardarPartida, obtenerPreguntas, verificarRespuesta } from '../services/api';

type Guardado = 'pendiente' | 'guardando' | 'ok' | 'error';

/**
 * Estado de la partida en curso. Es la única fuente de verdad que comparten el formulario,
 * el juego y el resultado.
 */
export const usePartidaStore = defineStore('partida', () => {
  const jugador = ref('');
  const franquicia = ref('');
  const franquiciaNombre = ref('');
  const nivel = ref<Nivel | null>(null);
  const preguntas = ref<PreguntaPublica[]>([]);
  const indice = ref(0);
  const puntaje = ref(0);
  const seleccionada = ref<string | null>(null);
  const verificada = ref<RespuestaVerificada | null>(null); // respuesta del servidor a la pregunta actual
  const respondiendo = ref(false);
  const terminada = ref(false);
  const guardado = ref<Guardado>('pendiente');

  const preguntaActual = computed(() => preguntas.value[indice.value] ?? null);
  const esUltima = computed(() => indice.value === preguntas.value.length - 1);

  /** Datos del formulario de inicio. Empieza de cero cualquier partida anterior. */
  function configurar(nombre: string, nombreFranquicia: string) {
    reiniciar();
    jugador.value = nombre;
    franquiciaNombre.value = nombreFranquicia;
  }

  function reiniciar() {
    franquicia.value = '';
    nivel.value = null;
    preguntas.value = [];
    indice.value = 0;
    puntaje.value = 0;
    seleccionada.value = null;
    verificada.value = null;
    respondiendo.value = false;
    terminada.value = false;
    guardado.value = 'pendiente';
  }

  async function iniciar(slug: string, nivelElegido: Nivel) {
    reiniciar();
    preguntas.value = await obtenerPreguntas(slug, nivelElegido);
    franquicia.value = slug;
    nivel.value = nivelElegido;
  }

  /** opcion = null cuando se acaba el tiempo. El servidor decide si es correcta. */
  async function responder(opcion: string | null) {
    const pregunta = preguntaActual.value;
    if (!pregunta || verificada.value || respondiendo.value) return;

    respondiendo.value = true;
    seleccionada.value = opcion;
    try {
      const resultado = await verificarRespuesta(pregunta.id, opcion);
      verificada.value = resultado;
      if (resultado.correcta) puntaje.value++;
    } catch (error) {
      seleccionada.value = null; // se podrá volver a intentar
      throw error;
    } finally {
      respondiendo.value = false;
    }
  }

  function siguiente() {
    indice.value++;
    seleccionada.value = null;
    verificada.value = null;
  }

  /** Cierra la partida y la guarda en el ranking de Express (POST /api/ranking). */
  async function terminar() {
    terminada.value = true;
    await guardar();
  }

  async function guardar() {
    if (!nivel.value) return;
    guardado.value = 'guardando';
    try {
      await guardarPartida({
        jugador: jugador.value,
        franquicia: franquicia.value,
        nivel: nivel.value,
        puntaje: puntaje.value,
        total: preguntas.value.length
      });
      guardado.value = 'ok';
    } catch {
      guardado.value = 'error';
    }
  }

  return {
    jugador, franquicia, franquiciaNombre, nivel, preguntas, indice, puntaje,
    seleccionada, verificada, respondiendo, terminada, guardado,
    preguntaActual, esUltima,
    configurar, reiniciar, iniciar, responder, siguiente, terminar, guardar
  };
});
