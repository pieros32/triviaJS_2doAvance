import { existsSync, readFileSync, writeFileSync } from 'node:fs';

import type { Nivel, RegistroRanking } from '@trivia/shared';

const MAXIMO_GUARDADO = 500;

export interface FiltrosRanking {
  franquicia?: string;
  nivel?: Nivel;
  limite: number;
}

/** Guarda el ranking global en un archivo JSON (o solo en memoria si no se da archivo). */
export class AlmacenRanking {
  private registros: RegistroRanking[];

  constructor(private readonly archivo: string | null) {
    this.registros = this.cargar();
  }

  agregar(nuevos: RegistroRanking[]): void {
    this.registros = [...this.registros, ...nuevos].slice(-MAXIMO_GUARDADO);
    this.guardar();
  }

  listar({ franquicia, nivel, limite }: FiltrosRanking): RegistroRanking[] {
    return this.registros
      .filter((r) => (!franquicia || r.franquicia === franquicia) && (!nivel || r.nivel === nivel))
      .sort((a, b) => b.puntaje - a.puntaje || b.fecha.localeCompare(a.fecha))
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
