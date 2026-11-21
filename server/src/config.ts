import { join } from 'node:path';

const RAIZ = join(import.meta.dirname, '..');

export interface ConfigJuego {
  tiempoPreguntaMs: number;
  tiempoRevelacionMs: number;
  preguntasPorPartida: number;
}

export interface ConfigServidor extends ConfigJuego {
  puerto: number;
  origenesPermitidos: string[];
  archivoDatos: string;
  carpetaImagenes: string;
  archivoRanking: string | null; // null = ranking solo en memoria
}

function numero(valor: string | undefined, porDefecto: number): number {
  const convertido = Number(valor);
  return valor !== undefined && Number.isFinite(convertido) && convertido > 0 ? convertido : porDefecto;
}

export function leerConfig(env: NodeJS.ProcessEnv = process.env): ConfigServidor {
  return {
    puerto: numero(env.PORT, 4000),
    // Vue (Vite) en 5173 y Next en 3000
    origenesPermitidos: (env.CORS_ORIGINS ?? 'http://localhost:5173,http://localhost:3000').split(','),
    tiempoPreguntaMs: numero(env.TIEMPO_PREGUNTA_MS, 15_000),
    tiempoRevelacionMs: numero(env.TIEMPO_REVELACION_MS, 4_000),
    preguntasPorPartida: numero(env.PREGUNTAS_POR_PARTIDA, 10),
    archivoDatos: join(RAIZ, 'data', 'db.json'),
    carpetaImagenes: join(RAIZ, 'public', 'imagenes'),
    archivoRanking: env.ARCHIVO_RANKING ?? join(RAIZ, 'data', 'ranking.json')
  };
}
