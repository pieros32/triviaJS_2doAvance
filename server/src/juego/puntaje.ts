export const PUNTOS_BASE = 100;
export const PUNTOS_BONO_MAXIMO = 100;

/**
 * Acertar da 100 puntos, más hasta 100 de bono según lo rápido que se respondió.
 * Fallar o no responder da 0.
 */
export function calcularPuntos(acerto: boolean, restanteMs: number, duracionMs: number): number {
  if (!acerto) return 0;
  const fraccion = duracionMs > 0 ? Math.min(Math.max(restanteMs / duracionMs, 0), 1) : 0;
  return PUNTOS_BASE + Math.round(PUNTOS_BONO_MAXIMO * fraccion);
}
