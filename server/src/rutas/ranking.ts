import { esNivel, type RegistroRanking } from '@trivia/shared';
import { randomUUID } from 'node:crypto';
import { Router } from 'express';

import type { Repositorio } from '../datos/repositorio';
import type { AlmacenRanking } from '../ranking/almacen';
import { validarNuevoRegistro } from '../validaciones';

export function rutaRanking(ranking: AlmacenRanking, repositorio: Repositorio): Router {
  const router = Router();

  // GET /api/ranking?franquicia=&nivel=&limite=
  router.get('/', (req, res) => {
    const { franquicia, nivel } = req.query;
    const limite = req.query.limite === undefined ? 20 : Number(req.query.limite);
    const nivelInvalido = nivel !== undefined && (typeof nivel !== 'string' || !esNivel(nivel));
    const franquiciaInvalida = franquicia !== undefined && typeof franquicia !== 'string';
    if (nivelInvalido || franquiciaInvalida || !Number.isInteger(limite) || limite < 1 || limite > 100) {
      res.status(400).json({ error: 'Parámetros de ranking no válidos.' });
      return;
    }
    res.json(
      ranking.listar({
        franquicia: franquicia as string | undefined,
        nivel: nivel as RegistroRanking['nivel'] | undefined,
        limite
      })
    );
  });

  // POST /api/ranking  →  201 con el registro guardado
  router.post('/', (req, res) => {
    const datos = validarNuevoRegistro(req.body, repositorio);
    if (!datos.ok) {
      res.status(400).json({ error: datos.error });
      return;
    }
    const registro: RegistroRanking = {
      ...datos.valor,
      id: randomUUID(),
      franquiciaNombre: repositorio.buscarFranquicia(datos.valor.franquicia)!.nombre,
      fecha: new Date().toISOString()
    };
    ranking.agregar(registro);
    res.status(201).json(registro);
  });

  // DELETE /api/ranking/:id  →  204 sin cuerpo
  router.delete('/:id', (req, res) => {
    if (!ranking.eliminar(req.params.id)) {
      res.status(404).json({ error: 'No existe esa partida en el ranking.' });
      return;
    }
    res.status(204).end();
  });

  // DELETE /api/ranking  →  borra todo el historial
  router.delete('/', (_req, res) => {
    ranking.vaciar();
    res.status(204).end();
  });

  return router;
}
