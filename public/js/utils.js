// Utilidades sin dependencias.

export const NIVELES = ['facil', 'intermedio', 'experto'];

const NOMBRES_NIVEL = {
  facil: 'Fácil',
  intermedio: 'Intermedio',
  experto: 'Experto'
};

/** 'facil' → 'Fácil'. Si no hay nivel devuelve '—'. */
export function nombreNivel(nivel) {
  return NOMBRES_NIVEL[nivel] ?? '—';
}

/** Comprueba si un texto (por ejemplo, el de la URL) es un nivel válido. */
export function esNivel(valor) {
  return NIVELES.includes(valor);
}

/** Escapa texto para insertarlo de forma segura dentro de innerHTML. */
export function esc(texto) {
  return String(texto ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Mezcla una lista con Fisher–Yates y devuelve una copia nueva. */
export function mezclar(lista) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}
