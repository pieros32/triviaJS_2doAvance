/**
 * Mezcla una lista con el algoritmo Fisher–Yates y devuelve una copia nueva.
 *
 * Reemplaza al `sort(() => Math.random() - 0.5)` de la versión en JS puro:
 * ese truco no produce una mezcla uniforme (unas órdenes salen más que otras).
 * Fisher–Yates da a cada orden la misma probabilidad.
 */
export function mezclar<T>(lista: readonly T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
