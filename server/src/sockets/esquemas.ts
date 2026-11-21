import { LONGITUD_CODIGO, NIVELES, NOMBRE_MAX, NOMBRE_MIN } from '@trivia/shared';
import { z } from 'zod';

// Todo lo que llega por socket es "no confiable": se valida antes de tocar el juego.
const nombre = z
  .string()
  .trim()
  .min(NOMBRE_MIN, `El nombre debe tener al menos ${NOMBRE_MIN} caracteres.`)
  .max(NOMBRE_MAX, `El nombre admite como máximo ${NOMBRE_MAX} caracteres.`);

export const esquemaCrearSala = z.object({
  jugador: nombre,
  franquicia: z.string().min(1).max(60),
  nivel: z.enum(NIVELES as [string, ...string[]])
});

export const esquemaUnirse = z.object({
  codigo: z.string().trim().length(LONGITUD_CODIGO, 'El código de sala tiene 4 letras.').toUpperCase(),
  jugador: nombre
});

export const esquemaResponder = z.object({
  opcion: z.string().min(1).max(300)
});
