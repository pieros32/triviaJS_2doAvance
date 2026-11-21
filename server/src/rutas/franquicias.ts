import { Router } from 'express';

import type { Repositorio } from '../datos/repositorio';

export function rutaFranquicias(repositorio: Repositorio): Router {
  const router = Router();
  router.get('/', (_req, res) => {
    res.json(repositorio.franquicias());
  });
  return router;
}
