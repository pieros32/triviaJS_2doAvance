import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';

import BarraEstado from '../components/BarraEstado';
import Cargando from '../components/Cargando';
import ErrorCarga from '../components/ErrorCarga';
import TarjetaPregunta from '../components/TarjetaPregunta';
import { usePartida } from '../context/PartidaContext';
import { esNivel } from '../models/trivia';
import { obtenerPreguntas } from '../services/api';

// Segundos por pregunta
const TIEMPO_POR_PREGUNTA = 20;

interface ErrorJuego {
  titulo: string;
  mensaje: string;
}

export default function Juego() {
  const { franquicia = '', nivel = '' } = useParams();
  const navigate = useNavigate();
  const { estado, preguntaActual, reiniciar, iniciar, responder, siguiente } = usePartida();

  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<ErrorJuego | null>(null);
  const [segundos, setSegundos] = useState(TIEMPO_POR_PREGUNTA);
  const intervaloRef = useRef<number | null>(null);

  useEffect(() => {
    reiniciar();
    setError(null);
    setCargando(true);

    if (!esNivel(nivel)) {
      setError({ titulo: 'Nivel no válido:', mensaje: 'El nivel solicitado no existe. Elige Fácil, Intermedio o Experto.' });
      setCargando(false);
      return;
    }

    let activo = true;
    obtenerPreguntas(franquicia, nivel)
      .then((preguntas) => {
        if (!activo) return;
        if (preguntas.length === 0) {
          setError({
            titulo: 'Sin preguntas:',
            mensaje: 'Esta franquicia todavía no tiene preguntas cargadas. Elige otra franquicia.'
          });
        } else {
          iniciar(franquicia, nivel, preguntas);
          setSegundos(TIEMPO_POR_PREGUNTA);
        }
      })
      .catch(() => {
        if (activo) {
          setError({
            titulo: 'Error de conexión:',
            mensaje: 'No se pudieron cargar las preguntas. Verifica que json-server esté encendido (npm start) y vuelve a intentarlo.'
          });
        }
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [franquicia, nivel, reiniciar, iniciar]);

  const hayPregunta = !cargando && !error && preguntaActual !== null;

  // useRef guarda el id del intervalo sin volver a dibujar la pantalla
  useEffect(() => {
    if (!hayPregunta || estado.respondida) {
      return;
    }
    intervaloRef.current = window.setInterval(() => setSegundos((s) => s - 1), 1000);
    return () => {
      if (intervaloRef.current !== null) {
        window.clearInterval(intervaloRef.current);
        intervaloRef.current = null;
      }
    };
  }, [hayPregunta, estado.respondida, estado.indice]);

  useEffect(() => {
    if (hayPregunta && !estado.respondida && segundos <= 0) {
      responder(null);
    }
  }, [hayPregunta, estado.respondida, segundos, responder]);

  function alSiguiente() {
    const habiaRespondido = estado.respondida;
    if (habiaRespondido) {
      setSegundos(TIEMPO_POR_PREGUNTA);
    }
    // siguiente() devuelve false cuando ya no quedan preguntas
    if (!siguiente()) {
      navigate('/resultado');
    }
  }

  // Sin pasar por el formulario: vuelve al inicio
  if (!estado.jugador) {
    return <Navigate to="/" replace />;
  }

  if (cargando) {
    return <Cargando texto="Cargando preguntas…" />;
  }

  if (error) {
    return (
      <div className="pantalla">
        <ErrorCarga titulo={error.titulo} mensaje={error.mensaje} />
        <Link className="btn-accion btn-secundario" to="/">
          Volver al inicio
        </Link>
      </div>
    );
  }

  if (!preguntaActual) {
    return null;
  }

  const total = estado.preguntas.length;

  return (
    <div className="pantalla">
      <BarraEstado
        jugador={estado.jugador}
        nivel={estado.nivel}
        numero={estado.indice + 1}
        total={total}
        puntaje={estado.puntaje}
        segundos={segundos}
        completadas={estado.indice + (estado.respondida ? 1 : 0)}
      />

      <TarjetaPregunta
        pregunta={preguntaActual}
        opciones={estado.opciones}
        seleccionada={estado.seleccionada}
        respondida={estado.respondida}
        mensaje={estado.mensaje}
        esUltima={estado.indice === total - 1}
        onElegir={responder}
        onSiguiente={alSiguiente}
      />
    </div>
  );
}
