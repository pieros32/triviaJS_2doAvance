import { existsSync, readFileSync, writeFileSync } from 'node:fs';

import type { Nivel, RegistroRanking } from '@trivia/shared';

const MAXIMO_GUARDADO = 500;

export interface FiltrosRanking {
  franquicia?: string;
  nivel?: Nivel;
  limite: number;
}

function porcentaje(r: Pick<RegistroRanking, 'puntaje' | 'total'>): number {
  return r.total > 0 ? Math.round((r.puntaje / r.total) * 100) : 0;
}

/** Guarda el ranking en un archivo JSON (o solo en memoria si no se da archivo): hace de "base de datos". */
export class AlmacenRanking {
  private registros: RegistroRanking[];

  constructor(private readonly archivo: string | null) {
    this.registros = this.cargar();
  }

  agregar(registro: RegistroRanking): void {
    this.registros = [...this.registros, registro].slice(-MAXIMO_GUARDADO);
    this.guardar();
  }

  /** Devuelve false si no existía ese id. */
  eliminar(id: string): boolean {
    const quedan = this.registros.filter((r) => r.id !== id);
    if (quedan.length === this.registros.length) return false;
    this.registros = quedan;
    this.guardar();
    return true;
  }

  vaciar(): void {
    this.registros = [];
    this.guardar();
  }

  // Mejor porcentaje primero; a igualdad, más aciertos y luego la partida más reciente
  listar({ franquicia, nivel, limite }: FiltrosRanking): RegistroRanking[] {
    return this.registros
      .filter((r) => (!franquicia || r.franquicia === franquicia) && (!nivel || r.nivel === nivel))
      .sort((a, b) => porcentaje(b) - porcentaje(a) || b.puntaje - a.puntaje || b.fecha.localeCompare(a.fecha))
      .slice(0, limite);
  }

  private cargar(): RegistroRanking[] {
    if (!this.archivo || !existsSync(this.archivo)) {
      return [];
    }
    try {
      const datos: unknown = JSON.parse(readFileSync(this.archivo, 'utf-8'));
      return Array.isArray(datos) ? (datos as RegistroRanking[]) : [];
    } catch {
      return []; // archivo dañado: se empieza de cero
    }
  }

  private guardar(): void {
    if (!this.archivo) return;
    try {
      writeFileSync(this.archivo, JSON.stringify(this.registros, null, 2));
    } catch (error) {
      console.error('No se pudo guardar el ranking:', error);
    }
  }
}
