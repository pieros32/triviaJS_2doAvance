import type { Franquicia, Nivel, Pregunta } from '../models/trivia';

// json-server (solo lectura)
const API = 'http://localhost:3000';

async function pedir<T>(ruta: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(API + ruta);
  if (params) {
    Object.entries(params).forEach(([clave, valor]) => url.searchParams.set(clave, valor));
  }
  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error(`HTTP ${respuesta.status}`);
  }
  return (await respuesta.json()) as T;
}

export function obtenerFranquicias(): Promise<Franquicia[]> {
  return pedir<Franquicia[]>('/franquicias');
}

export function obtenerPreguntas(franquicia: string, nivel: Nivel): Promise<Pregunta[]> {
  return pedir<Pregunta[]>('/preguntas', { franquicia, nivel });
}
