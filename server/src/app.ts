import cors from 'cors';
import express, { type Express } from 'express';

import type { ConfigServidor } from './config';
import type { Repositorio } from './datos/repositorio';
import { manejarErrores, noEncontrado } from './middleware/errores';
import type { AlmacenRanking } from './ranking/almacen';
import { rutaFranquicias } from './rutas/franquicias';
import { rutaPreguntas } from './rutas/preguntas';
import { rutaRanking } from './rutas/ranking';

interface Dependencias {
  config: ConfigServidor;
  repositorio: Repositorio;
  ranking: AlmacenRanking;
}

export function crearApp({ config, repositorio, ranking }: Dependencias): Express {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: config.origenesPermitidos }));
  app.use(express.json());

  // Las imágenes de las preguntas las sirve el backend, así ambos clientes comparten los mismos archivos
  app.use('/imagenes', express.static(config.carpetaImagenes, { maxAge: '1d' }));

  app.get('/api/salud', (_req, res) => {
    res.json({ ok: true });
  });
  app.use('/api/franquicias', rutaFranquicias(repositorio));
  app.use('/api/preguntas', rutaPreguntas(repositorio));
  app.use('/api/ranking', rutaRanking(ranking, repositorio));

  app.use(noEncontrado);
  app.use(manejarErrores);
  return app;
}
