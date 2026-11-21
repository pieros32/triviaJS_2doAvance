import { TIEMPO_POR_PREGUNTA_S, esNivel } from '@trivia/shared';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

import { usePartida } from '../context/PartidaContext';
import { useCuentaRegresiva } from '../hooks/useCuentaRegresiva';
import BarraEstado from './BarraEstado';
import Cargando from './Cargando';
import ErrorCarga from './ErrorCarga';
import TarjetaPregunta from './TarjetaPregunta';

interface ErrorJuego {
  titulo: string;
  mensaje: string;
}

export default function Juego() {
  const router = useRouter();
  const partida = usePartida();
  const { iniciar, responder } = partida;

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<ErrorJuego | null>(null);
  const [aviso, setAviso] = useState('');
  const [finPreguntaEn, setFinPreguntaEn] = useState(0); // marca de tiempo (ms) en la que se acaba la pregunta

  // En las rutas dinámicas los parámetros están disponibles cuando router.isReady es true
  const franquicia = typeof router.query.franquicia === 'string' ? router.query.franquicia : '';
  const nivel = typeof router.query.nivel === 'string' ? router.query.nivel : '';
  const hayJugador = partida.jugador !== '';

  const reiniciarReloj = () => setFinPreguntaEn(Date.now() + TIEMPO_POR_PREGUNTA_S * 1000);

  // Sin pasar por el formulario (por ejemplo al recargar) no hay jugador: se vuelve al inicio
  useEffect(() => {
    if (router.isReady && !hayJugador) router.replace('/');
  }, [router, hayJugador]);

  useEffect(() => {
    if (!router.isReady || !hayJugador) return;
    if (!esNivel(nivel)) {
      setError({ titulo: 'Nivel no válido:', mensaje: 'El nivel solicitado no existe. Elige Fácil, Intermedio o Experto.' });
      setCargando(false);
      return;
    }

    let activo = true; // evita actualizar el estado si ya se salió de la pantalla
    setCargando(true);
    setError(null);
    iniciar(franquicia, nivel)
      .then((cantidad) => {
        if (!activo) return;
        if (cantidad === 0) {
          setError({ titulo: 'Sin preguntas:', mensaje: 'Esta franquicia todavía no tiene preguntas cargadas. Elige otra franquicia.' });
        } else {
          setFinPreguntaEn(Date.now() + TIEMPO_POR_PREGUNTA_S * 1000);
        }
      })
      .catch(() => {
        if (activo) {
          setError({
            titulo: 'Error de conexión:',
            mensaje: 'No se pudieron cargar las preguntas. Verifica que el servidor esté encendido (npm run dev:server) y vuelve a intentarlo.'
          });
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, [router.isReady, hayJugador, franquicia, nivel, iniciar]);

  const { preguntaActual, verificada } = partida;
  // El reloj corre solo mientras la pregunta sigue abierta
  const abierta = !cargando && !error && preguntaActual !== null && verificada === null;
  const segundos = useCuentaRegresiva(finPreguntaEn, abierta);

  async function elegir(opcion: string | null) {
    setAviso('');
    try {
      await responder(opcion);
    } catch (e) {
      setAviso((e as Error).message);
    }
  }

  // Al llegar a 0 sin haber respondido, se envía opcion null y el servidor la da por fallada
  useEffect(() => {
    if (abierta && segundos <= 0) void elegir(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierta, segundos]);

  async function alSiguiente() {
    if (!verificada) {
      setAviso('Debes responder la pregunta actual para continuar.');
      return;
    }
    setAviso('');
    if (partida.esUltima) {
      await partida.terminar();
      router.push('/resultado');
      return;
    }
    reiniciarReloj(); // junto con siguiente(), para que el reloj nunca arranque en 0
    partida.siguiente();
  }

  if (!hayJugador || cargando) {
    return <Cargando texto="Cargando preguntas…" />;
  }

  if (error) {
    return (
      <div className="pantalla">
        <ErrorCarga titulo={error.titulo} mensaje={error.mensaje} />
        <Link className="btn-accion btn-secundario" href="/">
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (!preguntaActual || !partida.nivel) return null;

  let mensaje = '';
  let colorMensaje = 'text-warning';
  if (aviso) {
    mensaje = aviso;
  } else if (verificada) {
    if (verificada.correcta) {
      mensaje = '¡Respuesta correcta!';
      colorMensaje = 'text-success';
    } else {
      mensaje =
        partida.seleccionada === null
          ? `Se acabó el tiempo. La respuesta era ${verificada.respuestaCorrecta}`
          : `Respuesta incorrecta. La respuesta era ${verificada.respuestaCorrecta}`;
      colorMensaje = 'text-danger';
    }
  }

  return (
    <div className="pantalla">
      <BarraEstado
        jugador={partida.jugador}
        nivel={partida.nivel}
        numero={partida.indice + 1}
        total={partida.preguntas.length}
        puntaje={partida.puntaje}
        segundos={abierta ? segundos : 0}
        completadas={partida.indice + (verificada ? 1 : 0)}
      />

      <TarjetaPregunta
        pregunta={preguntaActual}
        seleccionada={partida.seleccionada}
        correcta={verificada?.respuestaCorrecta ?? null}
        bloqueada={verificada !== null || partida.respondiendo}
        mensaje={mensaje}
        colorMensaje={colorMensaje}
        esUltima={partida.esUltima}
        onElegir={elegir}
        onSiguiente={alSiguiente}
      />
    </div>
  );
}
