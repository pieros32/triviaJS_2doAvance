import { NIVELES } from '@trivia/shared';
import { Router } from 'express';
import { z } from 'zod';

import { aPublica, type Repositorio } from '../datos/repositorio';

const consulta = z.object({
  franquicia: z.string().min(1),
  nivel: z.enum(NIVELES as [string, ...string[]])
});

/** Consulta de preguntas. Nunca incluye la respuesta correcta ni deja las opciones en su orden original. */
export function rutaPreguntas(repositorio: Repositorio): Router {
  const router = Router();
  router.get('/', (req, res) => {
    const parametros = consulta.safeParse(req.query);
    if (!parametros.success) {
      res.status(400).json({ error: 'Indica ?franquicia=<slug>&nivel=facil|intermedio|experto.' });
      return;
    }
    const { franquicia, nivel } = parametros.data;
    res.json(repositorio.preguntas(franquicia, nivel as (typeof NIVELES)[number]).map(aPublica));
  });
  return router;
}
