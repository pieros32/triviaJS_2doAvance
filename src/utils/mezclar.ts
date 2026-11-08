/**
 * Mezcla una lista con el algoritmo Fisher–Yates y devuelve una copia nueva.
 * Cada orden posible tiene la misma probabilidad (a diferencia de sort(() => Math.random() - 0.5)).
 */
export function mezclar<T>(lista: readonly T[]): T[] {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
