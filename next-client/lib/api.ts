import type {
  Franquicia,
  Nivel,
  NuevoRegistro,
  PreguntaPublica,
  RegistroRanking,
  RespuestaVerificada
} from '@trivia/shared';
import axios, { isAxiosError } from 'axios';

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

// Una instancia de Axios con la URL base. Se usa tanto en el servidor de Next
// (getStaticProps y getServerSideProps) como en el navegador.
const cliente = axios.create({ baseURL: API_URL });

// Express responde { error: "..." } en los 400 y 404: se convierte en un Error con ese mensaje
cliente.interceptors.response.use(
  (respuesta) => respuesta,
  (error: unknown) => {
    if (isAxiosError<{ error?: string }>(error)) {
      const mensaje = error.response
        ? (error.response.data?.error ?? `HTTP ${error.response.status}`)
        : 'No se pudo conectar con el servidor.';
      return Promise.reject(new Error(mensaje));
    }
    return Promise.reject(error);
  }
);

export const obtenerFranquicias = async () => (await cliente.get<Franquicia[]>('/api/franquicias')).data;

export const obtenerPreguntas = async (franquicia: string, nivel: Nivel) =>
  (await cliente.get<PreguntaPublica[]>('/api/preguntas', { params: { franquicia, nivel } })).data;

/** opcion = null significa que se acabó el tiempo. */
export const verificarRespuesta = async (id: number, opcion: string | null) =>
  (await cliente.post<RespuestaVerificada>(`/api/preguntas/${id}/respuesta`, { opcion })).data;

// Axios omite los parámetros undefined, así que un filtro vacío no se envía
export const obtenerRanking = async (franquicia: string, nivel: Nivel | '') =>
  (await cliente.get<RegistroRanking[]>('/api/ranking', { params: { franquicia: franquicia || undefined, nivel: nivel || undefined } })).data;

export const guardarPartida = async (registro: NuevoRegistro) =>
  (await cliente.post<RegistroRanking>('/api/ranking', registro)).data;

export const eliminarPartida = async (id: string): Promise<void> => {
  await cliente.delete(`/api/ranking/${id}`);
};

export const vaciarRanking = async (): Promise<void> => {
  await cliente.delete('/api/ranking');
};

/** Las imágenes viven en el servidor: la ruta del JSON es relativa a él. */
export const urlImagen = (ruta: string) => `${API_URL}/${ruta}`;
