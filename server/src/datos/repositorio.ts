import { readFileSync } from 'node:fs';

import type { Franquicia, Nivel, PreguntaPublica, TipoPregunta } from '@trivia/shared';

import { mezclar } from '../utils/mezclar';

/** Pregunta completa. Solo existe dentro del servidor porque incluye la respuesta. */
export interface PreguntaInterna {
  id: number;
  franquicia: string;
  nivel: Nivel;
  tipo?: TipoPregunta;
  pregunta: string;
  opciones: string[];
  respuesta: string;
  imagen: string | null;
}

interface BaseDatos {
  franquicias: Franquicia[];
  preguntas: PreguntaInterna[];
}

export class Repositorio {
  constructor(private readonly datos: BaseDatos) {}

  static desdeArchivo(ruta: string): Repositorio {
    return new Repositorio(JSON.parse(readFileSync(ruta, 'utf-8')) as BaseDatos);
  }

  franquicias(): Franquicia[] {
    return this.datos.franquicias;
  }

  buscarFranquicia(slug: string): Franquicia | undefined {
    return this.datos.franquicias.find((f) => f.slug === slug);
  }

  preguntas(franquicia: string, nivel: Nivel): PreguntaInterna[] {
    return this.datos.preguntas.filter((p) => p.franquicia === franquicia && p.nivel === nivel);
  }
}

/** Quita la respuesta y mezcla las opciones (en el JSON la correcta suele ir primera). */
export function aPublica(pregunta: PreguntaInterna): PreguntaPublica {
  return {
    id: pregunta.id,
    ...(pregunta.tipo ? { tipo: pregunta.tipo } : {}),
    pregunta: pregunta.pregunta,
    opciones: mezclar(pregunta.opciones),
    imagen: pregunta.imagen
  };
}
