import { join } from 'node:path';

const RAIZ = join(import.meta.dirname, '..');

export interface ConfigServidor {
  puerto: number;
  origenesPermitidos: string[];
  archivoDatos: string;
  carpetaImagenes: string;
  archivoRanking: string | null; // null = ranking solo en memoria
}

export function leerConfig(env: NodeJS.ProcessEnv = process.env): ConfigServidor {
  const puerto = Number(env.PORT);
  return {
    puerto: Number.isInteger(puerto) && puerto > 0 ? puerto : 4000,
    // Vue (Vite) en 5173 y Next en 3000
    origenesPermitidos: (env.CORS_ORIGINS ?? 'http://localhost:5173,http://localhost:3000').split(','),
    archivoDatos: join(RAIZ, 'data', 'db.json'),
    carpetaImagenes: join(RAIZ, 'public', 'imagenes'),
    archivoRanking: env.ARCHIVO_RANKING ?? join(RAIZ, 'data', 'ranking.json')
  };
}
