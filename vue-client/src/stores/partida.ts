import type { Nivel, PreguntaPublica, RespuestaVerificada } from '@trivia/shared';
import { defineStore } from 'pinia';

import { guardarPartida, obtenerPreguntas, verificarRespuesta } from '../services/api';

type Guardado = 'pendiente' | 'guardando' | 'ok' | 'error';

/**
 * Estado de la partida en curso, con la misma estructura que un módulo de Vuex:
 * `state` (los datos), `getters` (valores derivados) y `actions` (lo que cambia el estado).
 */
export const usePartidaStore = defineStore('partida', {
  state: () => ({
    jugador: '',
    franquicia: '',
    franquiciaNombre: '',
    nivel: null as Nivel | null,
    preguntas: [] as PreguntaPublica[],
    indice: 0,
    puntaje: 0,
    seleccionada: null as string | null,
    verificada: null as RespuestaVerificada | null, // respuesta del servidor a la pregunta actual
    respondiendo: false,
    terminada: false,
    guardado: 'pendiente' as Guardado
  }),

  getters: {
    preguntaActual: (estado): PreguntaPublica | null => estado.preguntas[estado.indice] ?? null,
    esUltima: (estado): boolean => estado.indice === estado.preguntas.length - 1
  },

  actions: {
    /** Datos del formulario de inicio. Empieza de cero cualquier partida anterior. */
    configurar(nombre: string, nombreFranquicia: string) {
      this.reiniciar();
      this.jugador = nombre;
      this.franquiciaNombre = nombreFranquicia;
    },

    reiniciar() {
      this.franquicia = '';
      this.nivel = null;
      this.preguntas = [];
      this.indice = 0;
      this.puntaje = 0;
      this.seleccionada = null;
      this.verificada = null;
      this.respondiendo = false;
      this.terminada = false;
      this.guardado = 'pendiente';
    },

    async iniciar(slug: string, nivel: Nivel) {
      this.reiniciar();
      this.preguntas = await obtenerPreguntas(slug, nivel);
      this.franquicia = slug;
      this.nivel = nivel;
    },

    /** opcion = null cuando se acaba el tiempo. El servidor decide si es correcta. */
    async responder(opcion: string | null) {
      const pregunta = this.preguntaActual;
      if (!pregunta || this.verificada || this.respondiendo) return;

      this.respondiendo = true;
      this.seleccionada = opcion;
      try {
        const resultado = await verificarRespuesta(pregunta.id, opcion);
        this.verificada = resultado;
        if (resultado.correcta) this.puntaje++;
      } catch (error) {
        this.seleccionada = null; // se podrá volver a intentar
        throw error;
      } finally {
        this.respondiendo = false;
      }
    },

    siguiente() {
      this.indice++;
      this.seleccionada = null;
      this.verificada = null;
    },

    /** Cierra la partida y la guarda en el ranking de Express (POST /api/ranking). */
    async terminar() {
      this.terminada = true;
      await this.guardar();
    },

    async guardar() {
      if (!this.nivel) return;
      this.guardado = 'guardando';
      try {
        await guardarPartida({
          jugador: this.jugador,
          franquicia: this.franquicia,
          nivel: this.nivel,
          puntaje: this.puntaje,
          total: this.preguntas.length
        });
        this.guardado = 'ok';
      } catch {
        this.guardado = 'error';
      }
    }
  }
});
