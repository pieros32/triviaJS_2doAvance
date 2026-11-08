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

export interface Pregunta {
  id: number;
  franquicia: string;
  nivel: Nivel;
  tipo?: TipoPregunta;
  pregunta: string;
  opciones: string[];
  respuesta: string;
  imagen: string | null; // null = sin imagen
}

export interface RegistroRanking {
  id: string;
  jugador: string;
  franquicia: string;
  franquiciaNombre: string;
  nivel: Nivel;
  puntaje: number;
  total: number;
  fecha: string;
}

export interface Franquicia {
  id: number;
  slug: string;
  nombre: string;
}
