// ============================================================
// MODELOS (TypeScript)
// La "forma" de los datos de la trivia (db.json). Si un dato no
// coincide con estos tipos, el compilador avisa antes de ejecutar.
// ============================================================

/** Los tres niveles posibles. */
export type Nivel = 'facil' | 'intermedio' | 'experto';

export const NIVELES: Nivel[] = ['facil', 'intermedio', 'experto'];

export const NOMBRES_NIVEL: Record<Nivel, string> = {
  facil: 'Fácil',
  intermedio: 'Intermedio',
  experto: 'Experto'
};

/** Comprueba en tiempo de ejecución si un texto (por ejemplo, el de la URL) es un nivel válido. */
export function esNivel(valor: string): valor is Nivel {
  return (NIVELES as string[]).includes(valor);
}

export type TipoPregunta = 'Personaje' | 'Lugar' | 'Profesión';

/** Una pregunta tal como la entrega el backend. */
export interface Pregunta {
  id: number;
  franquicia: string; // slug, ej. "the-walking-dead"
  nivel: Nivel;
  tipo: TipoPregunta;
  pregunta: string;
  opciones: string[];
  respuesta: string;
  imagen: string; // ruta relativa a public/, ej. "imagenes/rick.jpg"
}

/** Una franquicia del catálogo. */
export interface Franquicia {
  id: number;
  slug: string;
  nombre: string;
}
