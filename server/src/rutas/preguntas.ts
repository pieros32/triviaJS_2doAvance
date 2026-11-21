import { esNivel, type RespuestaVerificada } from '@trivia/shared';
import { Router } from 'express';

import { aPublica, type Repositorio } from '../datos/repositorio';
import { validarOpcion } from '../validaciones';

export function rutaPreguntas(repositorio: Repositorio): Router {
  const router = Router();

  // Preguntas de una franquicia y nivel. Nunca incluye la respuesta correcta.
  router.get('/', (req, res) => {
    const { franquicia, nivel } = req.query;
    if (typeof franquicia !== 'string' || typeof nivel !== 'string' || !esNivel(nivel)) {
      res.status(400).json({ error: 'Indica ?franquicia=<slug>&nivel=facil|intermedio|experto.' });
      return;
    }
    res.json(repositorio.preguntas(franquicia, nivel).map(aPublica));
  });

  // El servidor es quien dice si la respuesta es correcta: así no viaja al navegador de antemano.
  router.post('/:id/respuesta', (req, res) => {
    const pregunta = repositorio.buscarPregunta(Number(req.params.id));
    if (!pregunta) {
      res.status(404).json({ error: 'No existe esa pregunta.' });
      return;
    }
    const opcion = validarOpcion(req.body, pregunta);
    if (!opcion.ok) {
      res.status(400).json({ error: opcion.error });
      return;
    }
    const respuesta: RespuestaVerificada = {
      correcta: opcion.valor === pregunta.respuesta,
      respuestaCorrecta: pregunta.respuesta
    };
    res.json(respuesta);
  });

  return router;
}
