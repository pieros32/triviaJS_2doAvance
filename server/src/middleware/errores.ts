import type { ErrorRequestHandler, RequestHandler } from 'express';

export const noEncontrado: RequestHandler = (_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada.' });
};

// Express 5 reconoce los manejadores de error por tener 4 parámetros
export const manejarErrores: ErrorRequestHandler = (error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ error: 'Error interno del servidor.' });
};
