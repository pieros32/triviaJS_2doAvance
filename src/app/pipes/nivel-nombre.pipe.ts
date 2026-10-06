import { Pipe, PipeTransform } from '@angular/core';

import { Nivel } from '../models/trivia.models';

// ============================================================
// PIPE PERSONALIZADO
// Un pipe transforma un valor SOLO para mostrarlo en la plantilla.
// Reemplaza al objeto `nombresNivel` de script.js:
//
//   {{ 'facil' | nivelNombre }}   →   Fácil
//   {{ null | nivelNombre }}      →   —
// ============================================================
const NOMBRES: Record<Nivel, string> = {
  facil: 'Fácil',
  intermedio: 'Intermedio',
  experto: 'Experto'
};

@Pipe({ name: 'nivelNombre' })
export class NivelNombrePipe implements PipeTransform {
  transform(nivel: Nivel | null | undefined): string {
    return nivel ? NOMBRES[nivel] : '—';
  }
}
