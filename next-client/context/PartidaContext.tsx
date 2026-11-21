import type { Nivel, PreguntaPublica, RespuestaVerificada } from '@trivia/shared';
import { createContext, useCallback, useContext, useMemo, useReducer, useRef, type ReactNode } from 'react';

import { guardarPartida, obtenerPreguntas, verificarRespuesta } from '../lib/api';

type Guardado = 'pendiente' | 'guardando' | 'ok' | 'error';

// ===== Estado =====

interface EstadoPartida {
  jugador: string;
  franquicia: string;
  franquiciaNombre: string;
  nivel: Nivel | null;
  preguntas: PreguntaPublica[];
  indice: number;
  puntaje: number;
  seleccionada: string | null;
  verificada: RespuestaVerificada | null; // respuesta del servidor a la pregunta actual
  respondiendo: boolean;
  terminada: boolean;
  guardado: Guardado;
}

const INICIAL: EstadoPartida = {
  jugador: '',
  franquicia: '',
  franquiciaNombre: '',
  nivel: null,
  preguntas: [],
  indice: 0,
  puntaje: 0,
  seleccionada: null,
  verificada: null,
  respondiendo: false,
  terminada: false,
  guardado: 'pendiente'
};

type Accion =
  | { tipo: 'CONFIGURAR'; jugador: string; franquiciaNombre: string }
  | { tipo: 'REINICIAR' }
  | { tipo: 'INICIAR'; franquicia: string; nivel: Nivel; preguntas: PreguntaPublica[] }
  | { tipo: 'RESPONDIENDO'; opcion: string | null }
  | { tipo: 'VERIFICADA'; resultado: RespuestaVerificada }
  | { tipo: 'ERROR_RESPUESTA' }
  | { tipo: 'SIGUIENTE' }
  | { tipo: 'TERMINAR' }
  | { tipo: 'GUARDADO'; estado: Guardado };

// ===== Reducer =====

function reducir(e: EstadoPartida, accion: Accion): EstadoPartida {
  switch (accion.tipo) {
    case 'CONFIGURAR':
      return { ...INICIAL, jugador: accion.jugador, franquiciaNombre: accion.franquiciaNombre };
    case 'REINICIAR':
      return { ...INICIAL, jugador: e.jugador, franquiciaNombre: e.franquiciaNombre };
    case 'INICIAR':
      return { ...INICIAL, jugador: e.jugador, franquiciaNombre: e.franquiciaNombre, franquicia: accion.franquicia, nivel: accion.nivel, preguntas: accion.preguntas };
    case 'RESPONDIENDO':
      return { ...e, respondiendo: true, seleccionada: accion.opcion };
    case 'VERIFICADA':
      return { ...e, respondiendo: false, verificada: accion.resultado, puntaje: e.puntaje + (accion.resultado.correcta ? 1 : 0) };
    case 'ERROR_RESPUESTA':
      return { ...e, respondiendo: false, seleccionada: null }; // se podrá volver a intentar
    case 'SIGUIENTE':
      return { ...e, indice: e.indice + 1, seleccionada: null, verificada: null };
    case 'TERMINAR':
      return { ...e, terminada: true };
    case 'GUARDADO':
      return { ...e, guardado: accion.estado };
  }
}

// ===== Contexto =====

interface ValorPartida extends EstadoPartida {
  preguntaActual: PreguntaPublica | null;
  esUltima: boolean;
  configurar: (jugador: string, franquiciaNombre: string) => void;
  /** Pide las preguntas a Express y empieza la partida. Devuelve cuántas llegaron. */
  iniciar: (franquicia: string, nivel: Nivel) => Promise<number>;
  responder: (opcion: string | null) => Promise<void>;
  siguiente: () => void;
  terminar: () => Promise<void>;
  guardar: () => Promise<void>;
}

const PartidaContext = createContext<ValorPartida | null>(null);

export function PartidaProvider({ children }: { children: ReactNode }) {
  const [e, dispatch] = useReducer(reducir, INICIAL);

  // Copia del estado más reciente para que las acciones sean estables y no lean un estado viejo
  const ultimo = useRef(e);
  ultimo.current = e;
  const respondiendoAhora = useRef(false); // evita enviar dos respuestas si se hace clic muy rápido

  const configurar = useCallback((jugador: string, franquiciaNombre: string) => dispatch({ tipo: 'CONFIGURAR', jugador, franquiciaNombre }), []);

  const iniciar = useCallback(async (franquicia: string, nivel: Nivel) => {
    dispatch({ tipo: 'REINICIAR' });
    const preguntas = await obtenerPreguntas(franquicia, nivel);
    dispatch({ tipo: 'INICIAR', franquicia, nivel, preguntas });
    return preguntas.length;
  }, []);

  const responder = useCallback(async (opcion: string | null) => {
    const { preguntas, indice, verificada } = ultimo.current;
    const pregunta = preguntas[indice];
    if (!pregunta || verificada || respondiendoAhora.current) return;

    respondiendoAhora.current = true;
    dispatch({ tipo: 'RESPONDIENDO', opcion });
    try {
      dispatch({ tipo: 'VERIFICADA', resultado: await verificarRespuesta(pregunta.id, opcion) });
    } catch (error) {
      dispatch({ tipo: 'ERROR_RESPUESTA' });
      throw error;
    } finally {
      respondiendoAhora.current = false;
    }
  }, []);

  const siguiente = useCallback(() => dispatch({ tipo: 'SIGUIENTE' }), []);

  const guardar = useCallback(async () => {
    const { jugador, franquicia, nivel, puntaje, preguntas } = ultimo.current;
    if (!nivel) return;
    dispatch({ tipo: 'GUARDADO', estado: 'guardando' });
    try {
      await guardarPartida({ jugador, franquicia, nivel, puntaje, total: preguntas.length }); // POST /api/ranking
      dispatch({ tipo: 'GUARDADO', estado: 'ok' });
    } catch {
      dispatch({ tipo: 'GUARDADO', estado: 'error' });
    }
  }, []);

  const terminar = useCallback(async () => {
    dispatch({ tipo: 'TERMINAR' });
    await guardar();
  }, [guardar]);

  const valor = useMemo<ValorPartida>(
    () => ({
      ...e,
      preguntaActual: e.preguntas[e.indice] ?? null,
      esUltima: e.indice === e.preguntas.length - 1,
      configurar, iniciar, responder, siguiente, terminar, guardar
    }),
    [e, configurar, iniciar, responder, siguiente, terminar, guardar]
  );

  return <PartidaContext.Provider value={valor}>{children}</PartidaContext.Provider>;
}

export function usePartida(): ValorPartida {
  const contexto = useContext(PartidaContext);
  if (!contexto) {
    throw new Error('usePartida debe usarse dentro de <PartidaProvider>');
  }
  return contexto;
}
