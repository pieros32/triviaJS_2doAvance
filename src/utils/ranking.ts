import type { RegistroRanking } from '../models/trivia';

// localStorage puede estar bloqueado: todo va en try/catch
const CLAVE = 'trivia-pop-ranking';
const MAXIMO = 200;

export function cargarRanking(): RegistroRanking[] {
  try {
    const crudo = localStorage.getItem(CLAVE);
    const datos: unknown = crudo ? JSON.parse(crudo) : [];
    return Array.isArray(datos) ? (datos as RegistroRanking[]) : [];
  } catch {
    return [];
  }
}

export function guardarRegistro(registro: RegistroRanking): void {
  try {
    const lista = [...cargarRanking(), registro].slice(-MAXIMO);
    localStorage.setItem(CLAVE, JSON.stringify(lista));
  } catch {
    // sin almacenamiento: se ignora
  }
}

export function limpiarRanking(): void {
  try {
    localStorage.removeItem(CLAVE);
  } catch {
    // se ignora
  }
}

export function porcentaje(registro: Pick<RegistroRanking, 'puntaje' | 'total'>): number {
  return registro.total > 0 ? Math.round((registro.puntaje / registro.total) * 100) : 0;
}

// Mejor porcentaje primero; a igualdad, la partida más reciente.
export function ordenarRanking(lista: RegistroRanking[]): RegistroRanking[] {
  return [...lista].sort(
    (a, b) => porcentaje(b) - porcentaje(a) || b.puntaje - a.puntaje || b.fecha.localeCompare(a.fecha)
  );
}

export function nuevoId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
