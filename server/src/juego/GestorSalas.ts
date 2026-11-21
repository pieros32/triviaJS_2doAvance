import { LONGITUD_CODIGO, type ConfigSala, type Nivel, type RegistroRanking } from '@trivia/shared';

import type { ConfigJuego } from '../config';
import type { Repositorio } from '../datos/repositorio';
import { ErrorJuego } from '../utils/errores';
import { elegirPreguntas, Sala, type Emisor } from './Sala';

// Sin vocales ni letras confundibles para que el código sea fácil de dictar
const ALFABETO = 'BCDFGHJKLMNPQRSTVWXYZ';

interface Dependencias {
  repositorio: Repositorio;
  tiempos: ConfigJuego;
  crearEmisor: (codigo: string) => Emisor;
  alTerminarPartida: (registros: RegistroRanking[]) => void;
}

/** Conoce todas las salas abiertas y en cuál está cada jugador. */
export class GestorSalas {
  private readonly salas = new Map<string, Sala>();
  private readonly salaDeJugador = new Map<string, string>();

  constructor(private readonly dep: Dependencias) {}

  crear(jugadorId: string, nombre: string, franquicia: string, nivel: Nivel): Sala {
    const datosFranquicia = this.dep.repositorio.buscarFranquicia(franquicia);
    if (!datosFranquicia) {
      throw new ErrorJuego('La franquicia elegida no existe.');
    }
    const disponibles = this.dep.repositorio.preguntas(franquicia, nivel);
    if (disponibles.length === 0) {
      throw new ErrorJuego('Esa franquicia todavía no tiene preguntas en ese nivel.');
    }

    this.salir(jugadorId);

    const config: ConfigSala = {
      franquicia,
      franquiciaNombre: datosFranquicia.nombre,
      nivel,
      totalPreguntas: Math.min(disponibles.length, this.dep.tiempos.preguntasPorPartida)
    };
    const codigo = this.generarCodigo();
    const sala = new Sala({
      codigo,
      config,
      tiempos: this.dep.tiempos,
      cargarPreguntas: () => elegirPreguntas(disponibles, config.totalPreguntas),
      emisor: this.dep.crearEmisor(codigo),
      alVaciarse: (c) => this.eliminar(c),
      alTerminar: this.dep.alTerminarPartida
    });

    this.salas.set(codigo, sala);
    this.registrarJugador(sala, jugadorId, nombre);
    return sala;
  }

  unirse(jugadorId: string, codigo: string, nombre: string): Sala {
    const sala = this.salas.get(codigo.toUpperCase());
    if (!sala) {
      throw new ErrorJuego('No existe una sala con ese código.');
    }
    if (this.salaDeJugador.get(jugadorId) !== sala.codigo) {
      this.salir(jugadorId);
    }
    this.registrarJugador(sala, jugadorId, nombre);
    return sala;
  }

  salaDe(jugadorId: string): Sala {
    const codigo = this.salaDeJugador.get(jugadorId);
    const sala = codigo ? this.salas.get(codigo) : undefined;
    if (!sala) {
      throw new ErrorJuego('No estás en ninguna sala.');
    }
    return sala;
  }

  salir(jugadorId: string): void {
    const codigo = this.salaDeJugador.get(jugadorId);
    if (!codigo) return;
    this.salaDeJugador.delete(jugadorId);
    this.salas.get(codigo)?.quitar(jugadorId);
  }

  cantidadSalas(): number {
    return this.salas.size;
  }

  private registrarJugador(sala: Sala, jugadorId: string, nombre: string): void {
    try {
      sala.agregar(jugadorId, nombre);
    } catch (error) {
      // Si la sala recién creada no pudo aceptar a su creador, no debe quedar abierta
      if (sala.estado().jugadores.length === 0) this.eliminar(sala.codigo);
      throw error;
    }
    this.salaDeJugador.set(jugadorId, sala.codigo);
  }

  private eliminar(codigo: string): void {
    this.salas.get(codigo)?.destruir();
    this.salas.delete(codigo);
    for (const [jugador, sala] of this.salaDeJugador) {
      if (sala === codigo) this.salaDeJugador.delete(jugador);
    }
  }

  private generarCodigo(): string {
    let codigo: string;
    do {
      codigo = Array.from({ length: LONGITUD_CODIGO }, () => ALFABETO[Math.floor(Math.random() * ALFABETO.length)]).join('');
    } while (this.salas.has(codigo));
    return codigo;
  }
}
