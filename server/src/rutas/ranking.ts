import { NIVELES } from '@trivia/shared';
import { Router } from 'express';
import { z } from 'zod';

import type { AlmacenRanking } from '../ranking/almacen';

const consulta = z.object({
  franquicia: z.string().min(1).optional(),
  nivel: z.enum(NIVELES as [string, ...string[]]).optional(),
  limite: z.coerce.number().int().min(1).max(100).default(20)
});

/**
 * Solo lectura: los resultados los registra el servidor cuando termina una partida.
 * No hay POST a propósito, para que nadie pueda inventar puntajes.
 */
export function rutaRanking(ranking: AlmacenRanking): Router {
  const router = Router();
  router.get('/', (req, res) => {
    const parametros = consulta.safeParse(req.query);
    if (!parametros.success) {
      res.status(400).json({ error: 'Parámetros de ranking no válidos.' });
      return;
    }
    const { franquicia, nivel, limite } = parametros.data;
    res.json(ranking.listar({ franquicia, nivel: nivel as (typeof NIVELES)[number] | undefined, limite }));
  });
  return router;
}
