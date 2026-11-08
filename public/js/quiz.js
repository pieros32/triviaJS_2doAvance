import { mezclar } from './utils.js';

// Estado de la partida. Lo escribe la pantalla de juego y lo lee la de resultado.
export const quiz = {
  franquicia: '',
  nivel: null,
  preguntas: [],
  indice: 0,
  puntaje: 0,
  terminado: false,
  /** Opciones de la pregunta actual, ya mezcladas (se mezclan UNA vez por pregunta). */
  opcionesActuales: [],

  get total() {
    return this.preguntas.length;
  },

  get preguntaActual() {
    return this.preguntas[this.indice] ?? null;
  },

  reiniciar() {
    this.franquicia = '';
    this.nivel = null;
    this.preguntas = [];
    this.indice = 0;
    this.puntaje = 0;
    this.terminado = false;
    this.opcionesActuales = [];
  },

  iniciar(franquicia, nivel, preguntas) {
    this.reiniciar();
    this.franquicia = franquicia;
    this.nivel = nivel;
    this.preguntas = preguntas;
    this.prepararOpciones();
  },

  /** Registra una respuesta. Devuelve true si fue correcta y suma el punto. */
  responder(opcion) {
    const acerto = opcion === this.preguntaActual?.respuesta;
    if (acerto) {
      this.puntaje++;
    }
    return acerto;
  },

  /** Pasa a la siguiente pregunta. Devuelve false si ya no quedan. */
  avanzar() {
    this.indice++;
    if (this.indice >= this.total) {
      this.terminado = true;
      return false;
    }
    this.prepararOpciones();
    return true;
  },

  prepararOpciones() {
    this.opcionesActuales = this.preguntaActual ? mezclar(this.preguntaActual.opciones) : [];
  }
};
