import { Injectable } from '@angular/core';

import { Nivel, Pregunta } from '../models/trivia.models';
import { mezclar } from '../utils/mezclar';

// ============================================================
// SERVICIO DE ESTADO DE LA PARTIDA
// En la versión JS puro, el estado vivía en variables globales
// (nivelActual, preguntaActual, puntaje...). Aquí vive en un
// servicio: la pantalla de juego lo escribe y la pantalla de
// resultado lo lee. Como es `providedIn: 'root'`, existe una sola
// instancia compartida por toda la aplicación.
// ============================================================
@Injectable({ providedIn: 'root' })
export class QuizService {
  franquicia = '';
  nivel: Nivel | null = null;
  preguntas: Pregunta[] = [];
  indice = 0;
  puntaje = 0;
  terminado = false;

  /** Opciones de la pregunta actual, ya mezcladas (se mezclan UNA vez por pregunta). */
  opcionesActuales: string[] = [];

  get total(): number {
    return this.preguntas.length;
  }

  get preguntaActual(): Pregunta | null {
    return this.preguntas[this.indice] ?? null;
  }

  /** Deja el servicio como nuevo (sin partida). */
  reiniciar(): void {
    this.franquicia = '';
    this.nivel = null;
    this.preguntas = [];
    this.indice = 0;
    this.puntaje = 0;
    this.terminado = false;
    this.opcionesActuales = [];
  }

  /** Comienza una partida con las preguntas que entregó el backend. */
  iniciar(franquicia: string, nivel: Nivel, preguntas: Pregunta[]): void {
    this.reiniciar();
    this.franquicia = franquicia;
    this.nivel = nivel;
    this.preguntas = preguntas;
    this.prepararOpciones();
  }

  /** Registra una respuesta. Devuelve true si fue correcta y suma el punto. */
  responder(opcion: string): boolean {
    const acerto = opcion === this.preguntaActual?.respuesta;
    if (acerto) {
      this.puntaje++;
    }
    return acerto;
  }

  /** Pasa a la siguiente pregunta. Devuelve false si ya no quedan (partida terminada). */
  avanzar(): boolean {
    this.indice++;
    if (this.indice >= this.total) {
      this.terminado = true;
      return false;
    }
    this.prepararOpciones();
    return true;
  }

  private prepararOpciones(): void {
    this.opcionesActuales = this.preguntaActual ? mezclar(this.preguntaActual.opciones) : [];
  }
}
