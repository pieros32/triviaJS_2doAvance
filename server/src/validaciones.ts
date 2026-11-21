import { NOMBRE_MAX, NOMBRE_MIN, esNivel, type NuevoRegistro } from '@trivia/shared';

import type { PreguntaInterna, Repositorio } from './datos/repositorio';

export type Resultado<T> = { ok: true; valor: T } | { ok: false; error: string };

const ok = <T>(valor: T): Resultado<T> => ({ ok: true, valor });
const error = (mensaje: string): Resultado<never> => ({ ok: false, error: mensaje });

function esEnteroEntre(valor: unknown, minimo: number, maximo: number): valor is number {
  return typeof valor === 'number' && Number.isInteger(valor) && valor >= minimo && valor <= maximo;
}

/** El cuerpo debe traer { opcion: "<texto de una opción>" } o { opcion: null } si se acabó el tiempo. */
export function validarOpcion(cuerpo: unknown, pregunta: PreguntaInterna): Resultado<string | null> {
  const opcion = (cuerpo as { opcion?: unknown } | undefined)?.opcion;
  if (opcion === null) return ok(null);
  if (typeof opcion !== 'string' || !pregunta.opciones.includes(opcion)) {
    return error('Envía { "opcion": "<una de las opciones>" } o { "opcion": null }.');
  }
  return ok(opcion);
}

/** Validación simple: datos coherentes y un puntaje que no supere el máximo posible. */
export function validarNuevoRegistro(cuerpo: unknown, repositorio: Repositorio): Resultado<NuevoRegistro> {
  const datos = (cuerpo ?? {}) as Record<string, unknown>;

  const jugador = typeof datos.jugador === 'string' ? datos.jugador.trim() : '';
  if (jugador.length < NOMBRE_MIN || jugador.length > NOMBRE_MAX) {
    return error(`El nombre debe tener entre ${NOMBRE_MIN} y ${NOMBRE_MAX} caracteres.`);
  }
  if (typeof datos.franquicia !== 'string' || !repositorio.buscarFranquicia(datos.franquicia)) {
    return error('La franquicia no existe.');
  }
  if (typeof datos.nivel !== 'string' || !esNivel(datos.nivel)) {
    return error('El nivel debe ser facil, intermedio o experto.');
  }

  const disponibles = repositorio.preguntas(datos.franquicia, datos.nivel).length;
  if (!esEnteroEntre(datos.total, 1, disponibles)) {
    return error(`El total debe ser un entero entre 1 y ${disponibles}.`);
  }
  if (!esEnteroEntre(datos.puntaje, 0, datos.total)) {
    return error(`El puntaje debe ser un entero entre 0 y ${datos.total}.`);
  }

  return ok({ jugador, franquicia: datos.franquicia, nivel: datos.nivel, puntaje: datos.puntaje, total: datos.total });
}
