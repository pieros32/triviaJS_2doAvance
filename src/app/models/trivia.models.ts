// ============================================================
// MODELOS (TypeScript)
// Aquí se define la "forma" de los datos de la trivia.
// Es la misma estructura que tenías en script.js, pero con tipos:
// si un dato no coincide con esta forma, el compilador avisa
// ANTES de ejecutar la app.
// ============================================================

/** Los tres niveles posibles. Cualquier otro texto es un error de compilación. */
export type Nivel = 'facil' | 'intermedio' | 'experto';

export const NIVELES: Nivel[] = ['facil', 'intermedio', 'experto'];

/** Comprueba en tiempo de ejecución si un texto (por ejemplo, el de la URL) es un nivel válido. */
export function esNivel(valor: string): valor is Nivel {
  return (NIVELES as string[]).includes(valor);
}

export type TipoPregunta = 'Personaje' | 'Lugar' | 'Profesión';

/** Una pregunta tal como la entrega el backend (db.json). */
export interface Pregunta {
  id: number;
  franquicia: string; // slug, ej. "the-walking-dead"
  nivel: Nivel;
  tipo: TipoPregunta;
  pregunta: string;
  opciones: string[];
  respuesta: string;
  imagen: string;
}

/** Una franquicia del catálogo (The Walking Dead, Breaking Bad, ...). */
export interface Franquicia {
  id: number;
  slug: string;
  nombre: string;
}
