import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  type ReactNode
} from 'react';

import type { Nivel, Pregunta } from '../models/trivia';
import { mezclar } from '../utils/mezclar';
import { guardarRegistro, nuevoId } from '../utils/ranking';

// ===== Estado de la partida =====

interface EstadoPartida {
  jugador: string;
  franquicia: string;
  franquiciaNombre: string;
  nivel: Nivel | null;
  preguntas: Pregunta[];
  indice: number;
  puntaje: number;
  opciones: string[];
  respondida: boolean;
  seleccionada: string | null;
  mensaje: string;
  terminado: boolean;
  registrado: boolean;
}

const ESTADO_INICIAL: EstadoPartida = {
  jugador: '',
  franquicia: '',
  franquiciaNombre: '',
  nivel: null,
  preguntas: [],
  indice: 0,
  puntaje: 0,
  opciones: [],
  respondida: false,
  seleccionada: null,
  mensaje: '',
  terminado: false,
  registrado: false
};

// ===== Acciones =====

type Accion =
  | { tipo: 'CONFIGURAR'; jugador: string; franquiciaNombre: string }
  | { tipo: 'REINICIAR' }
  | { tipo: 'INICIAR'; franquicia: string; nivel: Nivel; preguntas: Pregunta[]; opciones: string[] }
  | { tipo: 'RESPONDER'; opcion: string | null }
  | { tipo: 'AVISAR'; mensaje: string }
  | { tipo: 'SIGUIENTE'; opciones: string[] }
  | { tipo: 'REGISTRADO' };

// ===== Reducer =====

function reducir(estado: EstadoPartida, accion: Accion): EstadoPartida {
  switch (accion.tipo) {
    case 'CONFIGURAR':
      return { ...ESTADO_INICIAL, jugador: accion.jugador, franquiciaNombre: accion.franquiciaNombre };

    case 'REINICIAR':
      return { ...ESTADO_INICIAL, jugador: estado.jugador, franquiciaNombre: estado.franquiciaNombre };

    case 'INICIAR':
      return {
        ...ESTADO_INICIAL,
        jugador: estado.jugador,
        franquiciaNombre: estado.franquiciaNombre,
        franquicia: accion.franquicia,
        nivel: accion.nivel,
        preguntas: accion.preguntas,
        opciones: accion.opciones
      };

    case 'RESPONDER': {
      if (estado.respondida) {
        return estado;
      }
      const correcta = estado.preguntas[estado.indice]?.respuesta ?? '';
      const acerto = accion.opcion === correcta;
      let mensaje = '¡Respuesta correcta!';
      if (accion.opcion === null) {
        mensaje = `Se acabó el tiempo. La respuesta era ${correcta}`;
      } else if (!acerto) {
        mensaje = `Respuesta incorrecta. La respuesta era ${correcta}`;
      }
      return {
        ...estado,
        respondida: true,
        seleccionada: accion.opcion,
        puntaje: estado.puntaje + (acerto ? 1 : 0),
        mensaje
      };
    }

    case 'AVISAR':
      return { ...estado, mensaje: accion.mensaje };

    case 'SIGUIENTE': {
      const indice = estado.indice + 1;
      if (indice >= estado.preguntas.length) {
        return { ...estado, indice: estado.preguntas.length - 1, terminado: true };
      }
      return {
        ...estado,
        indice,
        opciones: accion.opciones,
        respondida: false,
        seleccionada: null,
        mensaje: ''
      };
    }

    case 'REGISTRADO':
      return { ...estado, registrado: true };
  }
}

// ===== Contexto =====

interface ValorContexto {
  estado: EstadoPartida;
  preguntaActual: Pregunta | null;
  configurar: (jugador: string, franquiciaNombre: string) => void;
  reiniciar: () => void;
  iniciar: (franquicia: string, nivel: Nivel, preguntas: Pregunta[]) => void;
  responder: (opcion: string | null) => void;
  siguiente: () => boolean;
}

const PartidaContext = createContext<ValorContexto | null>(null);

// ===== Proveedor =====

export function PartidaProvider({ children }: { children: ReactNode }) {
  const [estado, dispatch] = useReducer(reducir, ESTADO_INICIAL);

  const preguntaActual = estado.preguntas[estado.indice] ?? null;

  const configurar = useCallback(
    (jugador: string, franquiciaNombre: string) => dispatch({ tipo: 'CONFIGURAR', jugador, franquiciaNombre }),
    []
  );

  const reiniciar = useCallback(() => dispatch({ tipo: 'REINICIAR' }), []);

  const iniciar = useCallback((franquicia: string, nivel: Nivel, preguntas: Pregunta[]) => {
    dispatch({
      tipo: 'INICIAR',
      franquicia,
      nivel,
      preguntas,
      opciones: preguntas[0] ? mezclar(preguntas[0].opciones) : []
    });
  }, []);

  const responder = useCallback((opcion: string | null) => dispatch({ tipo: 'RESPONDER', opcion }), []);

  const siguiente = useCallback((): boolean => {
    if (!estado.respondida) {
      dispatch({ tipo: 'AVISAR', mensaje: 'Debes responder la pregunta actual para continuar.' });
      return true;
    }
    const proxima = estado.preguntas[estado.indice + 1];
    dispatch({ tipo: 'SIGUIENTE', opciones: proxima ? mezclar(proxima.opciones) : [] });
    return Boolean(proxima);
  }, [estado.respondida, estado.preguntas, estado.indice]);

  useEffect(() => {
    if (estado.terminado && !estado.registrado && estado.nivel) {
      guardarRegistro({
        id: nuevoId(),
        jugador: estado.jugador,
        franquicia: estado.franquicia,
        franquiciaNombre: estado.franquiciaNombre,
        nivel: estado.nivel,
        puntaje: estado.puntaje,
        total: estado.preguntas.length,
        fecha: new Date().toISOString()
      });
      dispatch({ tipo: 'REGISTRADO' });
    }
  }, [estado]);

  const valor = useMemo<ValorContexto>(
    () => ({ estado, preguntaActual, configurar, reiniciar, iniciar, responder, siguiente }),
    [estado, preguntaActual, configurar, reiniciar, iniciar, responder, siguiente]
  );

  return <PartidaContext.Provider value={valor}>{children}</PartidaContext.Provider>;
}

// ===== Hook =====

export function usePartida(): ValorContexto {
  const contexto = useContext(PartidaContext);
  if (!contexto) {
    throw new Error('usePartida debe usarse dentro de <PartidaProvider>');
  }
  return contexto;
}
