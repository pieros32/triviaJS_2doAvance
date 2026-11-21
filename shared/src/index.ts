// Contrato compartido entre el servidor Express y los dos clientes (Vue y Next).
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

// ===== Reglas =====

export const NOMBRE_MIN = 2;
export const NOMBRE_MAX = 20;
export const TIEMPO_POR_PREGUNTA_S = 20;

// ===== Respuestas =====

/** Lo que responde el servidor al verificar una opción. */
export interface RespuestaVerificada {
  correcta: boolean;
  respuestaCorrecta: string;
}

// ===== Ranking =====

/** Lo que envía el cliente al terminar una partida. */
export interface NuevoRegistro {
  jugador: string;
  franquicia: string;
  nivel: Nivel;
  puntaje: number; // aciertos
  total: number; // preguntas de la partida
}

/** Lo que guarda el servidor: añade identificador, nombre de la franquicia y fecha. */
export interface RegistroRanking extends NuevoRegistro {
  id: string;
  franquiciaNombre: string;
  fecha: string; // ISO 8601
}
