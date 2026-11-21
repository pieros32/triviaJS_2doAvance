import {
  MAX_JUGADORES,
  MIN_JUGADORES,
  type ConfigSala,
  type EstadoSala,
  type Fase,
  type FinPartida,
  type PosicionFinal,
  type PreguntaActual,
  type RegistroRanking,
  type Revelado,
  type RespuestaJugador
} from '@trivia/shared';

import type { ConfigJuego } from '../config';
import { aPublica, type PreguntaInterna } from '../datos/repositorio';
import { ErrorJuego } from '../utils/errores';
import { mezclar } from '../utils/mezclar';
import { calcularPuntos } from './puntaje';

/** Por dónde sale la información de la sala. La capa de sockets lo implementa. */
export interface Emisor {
  estado(estado: EstadoSala): void;
  pregunta(pregunta: PreguntaActual): void;
  revelado(revelado: Revelado): void;
  fin(fin: FinPartida): void;
}

interface Jugador {
  id: string;
  nombre: string;
  puntaje: number;
  aciertos: number;
  conectado: boolean;
  respuesta: { opcion: string; restanteMs: number } | null;
}

interface Dependencias {
  codigo: string;
  config: ConfigSala;
  tiempos: ConfigJuego;
  /** Pregunta con la que juega esta sala (ya elegidas y mezcladas). */
  cargarPreguntas: () => PreguntaInterna[];
  emisor: Emisor;
  /** La sala quedó vacía y debe eliminarse. */
  alVaciarse: (codigo: string) => void;
  /** La partida terminó: se guardan los resultados en el ranking global. */
  alTerminar: (registros: RegistroRanking[]) => void;
}

/**
 * Una sala de juego. El servidor es la autoridad: controla el tiempo, valida las respuestas
 * y calcula los puntajes. Los clientes solo muestran lo que reciben.
 */
export class Sala {
  readonly codigo: string;
  private fase: Fase = 'espera';
  private readonly jugadores = new Map<string, Jugador>();
  private anfitrionId = '';

  private preguntas: PreguntaInterna[] = [];
  private indice = -1;
  private opcionesActuales: string[] = [];
  private inicioPreguntaMs = 0;
  private temporizador: NodeJS.Timeout | null = null;

  constructor(private readonly dep: Dependencias) {
    this.codigo = dep.codigo;
  }

  // ===== Consulta =====

  estado(): EstadoSala {
    return {
      codigo: this.codigo,
      fase: this.fase,
      config: this.dep.config,
      jugadores: [...this.jugadores.values()].map((j) => ({
        id: j.id,
        nombre: j.nombre,
        puntaje: j.puntaje,
        conectado: j.conectado,
        esAnfitrion: j.id === this.anfitrionId,
        respondio: j.respuesta !== null
      }))
    };
  }

  // ===== Jugadores =====

  agregar(id: string, nombre: string): void {
    if (this.fase !== 'espera') {
      throw new ErrorJuego('La partida ya comenzó. Espera a que termine para unirte.');
    }
    if (this.jugadores.size >= MAX_JUGADORES) {
      throw new ErrorJuego(`La sala está llena (máximo ${MAX_JUGADORES} jugadores).`);
    }
    const repetido = [...this.jugadores.values()].some((j) => j.nombre.toLowerCase() === nombre.toLowerCase());
    if (repetido) {
      throw new ErrorJuego('Ese nombre ya está en uso en la sala. Elige otro.');
    }

    this.jugadores.set(id, { id, nombre, puntaje: 0, aciertos: 0, conectado: true, respuesta: null });
    if (!this.anfitrionId) {
      this.anfitrionId = id;
    }
    this.dep.emisor.estado(this.estado());
  }

  quitar(id: string): void {
    const jugador = this.jugadores.get(id);
    if (!jugador) return;

    // Antes o después de jugar se retira del todo; en plena partida solo se marca desconectado
    if (this.fase === 'espera' || this.fase === 'terminada') {
      this.jugadores.delete(id);
    } else {
      jugador.conectado = false;
    }

    const conectados = [...this.jugadores.values()].filter((j) => j.conectado);
    if (conectados.length === 0) {
      this.detenerTemporizador();
      this.dep.alVaciarse(this.codigo);
      return;
    }

    if (id === this.anfitrionId) {
      this.anfitrionId = conectados[0]!.id;
    }
    this.dep.emisor.estado(this.estado());

    // Si el que se fue era el único que faltaba por responder, no hay por qué esperar
    if (this.fase === 'pregunta' && this.todosRespondieron()) {
      this.revelar();
    }
  }

  // ===== Partida =====

  iniciar(solicitanteId: string): void {
    this.exigirAnfitrion(solicitanteId);
    if (this.fase !== 'espera') {
      throw new ErrorJuego('La partida ya está en curso.');
    }
    if (this.jugadores.size < MIN_JUGADORES) {
      throw new ErrorJuego(`Se necesitan al menos ${MIN_JUGADORES} jugadores para empezar.`);
    }

    this.preguntas = this.dep.cargarPreguntas();
    this.indice = -1;
    this.reiniciarPuntajes();
    this.siguientePregunta();
  }

  responder(id: string, opcion: string): void {
    const jugador = this.jugadores.get(id);
    if (!jugador) {
      throw new ErrorJuego('No estás en esta sala.');
    }
    if (this.fase !== 'pregunta') {
      throw new ErrorJuego('No hay ninguna pregunta activa.');
    }
    if (jugador.respuesta) {
      throw new ErrorJuego('Ya respondiste esta pregunta.');
    }
    if (!this.opcionesActuales.includes(opcion)) {
      throw new ErrorJuego('Esa opción no existe en la pregunta actual.');
    }

    const transcurrido = Date.now() - this.inicioPreguntaMs;
    jugador.respuesta = { opcion, restanteMs: Math.max(this.dep.tiempos.tiempoPreguntaMs - transcurrido, 0) };
    this.dep.emisor.estado(this.estado());

    if (this.todosRespondieron()) {
      this.revelar();
    }
  }

  revancha(solicitanteId: string): void {
    this.exigirAnfitrion(solicitanteId);
    if (this.fase !== 'terminada') {
      throw new ErrorJuego('Solo se puede pedir revancha cuando la partida terminó.');
    }
    this.fase = 'espera';
    this.reiniciarPuntajes();
    this.dep.emisor.estado(this.estado());
  }

  destruir(): void {
    this.detenerTemporizador();
  }

  // ===== Flujo interno =====

  private siguientePregunta(): void {
    this.indice++;
    const pregunta = this.preguntas[this.indice];
    if (!pregunta) {
      this.terminar();
      return;
    }

    const publica = aPublica(pregunta);
    this.opcionesActuales = publica.opciones;
    this.fase = 'pregunta';
    this.jugadores.forEach((j) => (j.respuesta = null));
    this.inicioPreguntaMs = Date.now();

    this.dep.emisor.estado(this.estado());
    this.dep.emisor.pregunta({
      ...publica,
      indice: this.indice,
      total: this.preguntas.length,
      duracionMs: this.dep.tiempos.tiempoPreguntaMs
    });
    this.programar(() => this.revelar(), this.dep.tiempos.tiempoPreguntaMs);
  }

  private revelar(): void {
    this.detenerTemporizador();
    const pregunta = this.preguntas[this.indice]!;
    const duracion = this.dep.tiempos.tiempoPreguntaMs;

    const respuestas: RespuestaJugador[] = [...this.jugadores.values()].map((jugador) => {
      const opcion = jugador.respuesta?.opcion ?? null;
      const correcta = opcion === pregunta.respuesta;
      const puntos = calcularPuntos(correcta, jugador.respuesta?.restanteMs ?? 0, duracion);
      jugador.puntaje += puntos;
      if (correcta) jugador.aciertos++;
      return { jugadorId: jugador.id, opcion, correcta, puntos };
    });

    this.fase = 'revelado';
    this.dep.emisor.estado(this.estado());
    this.dep.emisor.revelado({
      correcta: pregunta.respuesta,
      respuestas,
      esUltima: this.indice === this.preguntas.length - 1
    });
    this.programar(() => this.siguientePregunta(), this.dep.tiempos.tiempoRevelacionMs);
  }

  private terminar(): void {
    this.detenerTemporizador();
    this.fase = 'terminada';

    const ordenados = [...this.jugadores.values()].sort(
      (a, b) => b.puntaje - a.puntaje || b.aciertos - a.aciertos || a.nombre.localeCompare(b.nombre)
    );
    // Empate en puntaje y aciertos = misma posición
    const clasificacion: PosicionFinal[] = ordenados.map((j, i) => {
      const anterior = ordenados[i - 1];
      const empata = anterior && anterior.puntaje === j.puntaje && anterior.aciertos === j.aciertos;
      return {
        posicion: empata ? i : i + 1,
        jugadorId: j.id,
        nombre: j.nombre,
        puntaje: j.puntaje,
        aciertos: j.aciertos
      };
    });

    this.dep.emisor.estado(this.estado());
    this.dep.emisor.fin({ clasificacion, totalPreguntas: this.preguntas.length });

    const fecha = new Date().toISOString();
    this.dep.alTerminar(
      ordenados.map((j) => ({
        id: `${this.codigo}-${fecha}-${j.id}`,
        jugador: j.nombre,
        franquicia: this.dep.config.franquicia,
        franquiciaNombre: this.dep.config.franquiciaNombre,
        nivel: this.dep.config.nivel,
        puntaje: j.puntaje,
        aciertos: j.aciertos,
        totalPreguntas: this.preguntas.length,
        sala: this.codigo,
        fecha
      }))
    );
  }

  // ===== Utilidades =====

  private exigirAnfitrion(id: string): void {
    if (id !== this.anfitrionId) {
      throw new ErrorJuego('Solo el anfitrión de la sala puede hacer eso.');
    }
  }

  private todosRespondieron(): boolean {
    return [...this.jugadores.values()].filter((j) => j.conectado).every((j) => j.respuesta !== null);
  }

  private reiniciarPuntajes(): void {
    this.jugadores.forEach((j) => {
      j.puntaje = 0;
      j.aciertos = 0;
      j.respuesta = null;
    });
  }

  private programar(accion: () => void, ms: number): void {
    this.detenerTemporizador();
    this.temporizador = setTimeout(accion, ms);
  }

  private detenerTemporizador(): void {
    if (this.temporizador) {
      clearTimeout(this.temporizador);
      this.temporizador = null;
    }
  }
}

/** Elige al azar las preguntas de una partida. */
export function elegirPreguntas(disponibles: PreguntaInterna[], cantidad: number): PreguntaInterna[] {
  return mezclar(disponibles).slice(0, cantidad);
}
