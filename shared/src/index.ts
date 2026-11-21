// Contrato compartido entre el servidor (Express + Socket.IO) y los dos clientes (Vue y Next).
// Aquí solo viven tipos y constantes: ninguna lógica de interfaz.

// ===== Dominio =====

export type Nivel = 'facil' | 'intermedio' | 'experto';

export const NIVELES: Nivel[] = ['facil', 'intermedio', 'experto'];

export const NOMBRES_NIVEL: Record<Nivel, string> = {
  facil: 'Fácil',
  intermedio: 'Intermedio',
  experto: 'Experto'
};

export function esNivel(valor: string): valor is Nivel {
  return (NIVELES as string[]).includes(valor);
}

export type TipoPregunta = 'Personaje' | 'Lugar' | 'Profesión';

export interface Franquicia {
  id: number;
  slug: string;
  nombre: string;
}

/** Pregunta tal como la ve un cliente: nunca incluye la respuesta correcta. */
export interface PreguntaPublica {
  id: number;
  tipo?: TipoPregunta;
  pregunta: string;
  opciones: string[]; // ya mezcladas por el servidor
  imagen: string | null; // ruta relativa, p. ej. "imagenes/rick.jpg"
}

// ===== Reglas de la sala =====

export const MIN_JUGADORES = 2;
export const MAX_JUGADORES = 4;
export const LONGITUD_CODIGO = 4;
export const NOMBRE_MIN = 2;
export const NOMBRE_MAX = 20;

// ===== Estado de la sala =====

export type Fase = 'espera' | 'pregunta' | 'revelado' | 'terminada';

export interface JugadorSala {
  id: string;
  nombre: string;
  puntaje: number;
  conectado: boolean;
  esAnfitrion: boolean;
  respondio: boolean; // solo indica si ya contestó, nunca qué contestó
}

export interface ConfigSala {
  franquicia: string;
  franquiciaNombre: string;
  nivel: Nivel;
  totalPreguntas: number;
}

export interface EstadoSala {
  codigo: string;
  fase: Fase;
  config: ConfigSala;
  jugadores: JugadorSala[];
}

// ===== Eventos de la partida =====

export interface PreguntaActual extends PreguntaPublica {
  indice: number; // base 0
  total: number;
  duracionMs: number; // tiempo disponible, contado desde que el cliente recibe el evento
}

export interface RespuestaJugador {
  jugadorId: string;
  opcion: string | null; // null = no respondió a tiempo
  correcta: boolean;
  puntos: number;
}

export interface Revelado {
  correcta: string;
  respuestas: RespuestaJugador[];
  esUltima: boolean;
}

export interface PosicionFinal {
  posicion: number;
  jugadorId: string;
  nombre: string;
  puntaje: number;
  aciertos: number;
}

export interface FinPartida {
  clasificacion: PosicionFinal[];
  totalPreguntas: number;
}

// ===== Ranking global (REST) =====

export interface RegistroRanking {
  id: string;
  jugador: string;
  franquicia: string;
  franquiciaNombre: string;
  nivel: Nivel;
  puntaje: number;
  aciertos: number;
  totalPreguntas: number;
  sala: string;
  fecha: string; // ISO 8601
}

// ===== Contrato de Socket.IO =====

export type Respuesta<T = void> = { ok: true; data: T } | { ok: false; error: string };
export type Ack<T = void> = (respuesta: Respuesta<T>) => void;

export interface DatosCrearSala {
  jugador: string;
  franquicia: string;
  nivel: Nivel;
}

export interface DatosUnirse {
  codigo: string;
  jugador: string;
}

/** Respuesta al crear o unirse a una sala: incluye el estado inicial para no depender del orden de los eventos. */
export interface SesionSala {
  codigo: string;
  jugadorId: string;
  estado: EstadoSala;
}

/** Eventos que envía el cliente. */
export interface ClientToServerEvents {
  'sala:crear': (datos: DatosCrearSala, ack: Ack<SesionSala>) => void;
  'sala:unirse': (datos: DatosUnirse, ack: Ack<SesionSala>) => void;
  'sala:salir': () => void;
  'partida:iniciar': (ack: Ack) => void;
  'partida:responder': (datos: { opcion: string }, ack: Ack) => void;
  'partida:revancha': (ack: Ack) => void;
}

/** Eventos que emite el servidor a todos los jugadores de la sala. */
export interface ServerToClientEvents {
  'sala:estado': (estado: EstadoSala) => void;
  'partida:pregunta': (pregunta: PreguntaActual) => void;
  'partida:revelado': (revelado: Revelado) => void;
  'partida:fin': (fin: FinPartida) => void;
}
