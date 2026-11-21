import type {
  Franquicia,
  Nivel,
  NuevoRegistro,
  PreguntaPublica,
  RegistroRanking,
  RespuestaVerificada
} from '@trivia/shared';

export const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

interface Opciones {
  metodo?: 'GET' | 'POST' | 'DELETE';
  params?: Record<string, string>;
  cuerpo?: unknown;
}

/** Un único punto para hablar con Express: arma la URL, envía JSON y traduce los errores. */
async function pedir<T>(ruta: string, { metodo = 'GET', params = {}, cuerpo }: Opciones = {}): Promise<T> {
  const url = new URL(API_URL + ruta);
  Object.entries(params).forEach(([clave, valor]) => valor && url.searchParams.set(clave, valor));

  const respuesta = await fetch(url, {
    method: metodo,
    headers: cuerpo === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo)
  });

  if (!respuesta.ok) {
    // Express responde { error: "..." } en los 400 y 404
    const detalle = (await respuesta.json().catch(() => null)) as { error?: string } | null;
    throw new Error(detalle?.error ?? `HTTP ${respuesta.status}`);
  }
  return respuesta.status === 204 ? (undefined as T) : ((await respuesta.json()) as T);
}

export const obtenerFranquicias = () => pedir<Franquicia[]>('/api/franquicias');

export const obtenerPreguntas = (franquicia: string, nivel: Nivel) =>
  pedir<PreguntaPublica[]>('/api/preguntas', { params: { franquicia, nivel } });

/** opcion = null significa que se acabó el tiempo. */
export const verificarRespuesta = (id: number, opcion: string | null) =>
  pedir<RespuestaVerificada>(`/api/preguntas/${id}/respuesta`, { metodo: 'POST', cuerpo: { opcion } });

export const obtenerRanking = (franquicia: string, nivel: Nivel | '') =>
  pedir<RegistroRanking[]>('/api/ranking', { params: { franquicia, nivel } });

export const guardarPartida = (registro: NuevoRegistro) =>
  pedir<RegistroRanking>('/api/ranking', { metodo: 'POST', cuerpo: registro });

export const eliminarPartida = (id: string) => pedir<void>(`/api/ranking/${id}`, { metodo: 'DELETE' });

export const vaciarRanking = () => pedir<void>('/api/ranking', { metodo: 'DELETE' });

/** Las imágenes viven en el servidor: la ruta del JSON es relativa a él. */
export const urlImagen = (ruta: string) => `${API_URL}/${ruta}`;
