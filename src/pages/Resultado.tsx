import { Link, Navigate } from 'react-router-dom';

import { usePartida } from '../context/PartidaContext';
import { NOMBRES_NIVEL } from '../models/trivia';

// Página de resultado (ruta /resultado). Lee la partida desde el contexto.
export default function Resultado() {
  const { estado } = usePartida();

  // Si alguien abre /resultado directamente (sin haber jugado), vuelve al inicio.
  if (!estado.terminado || !estado.nivel) {
    return <Navigate to="/" replace />;
  }

  const total = estado.preguntas.length;
  const porcentaje = total > 0 ? Math.round((estado.puntaje / total) * 100) : 0;
  const colorBarra = porcentaje >= 70 ? 'bg-success' : porcentaje >= 40 ? 'bg-warning' : 'bg-danger';

  return (
    <div className="pantalla">
      <article className="tarjeta-trivia tarjeta-resultado">
        <div className="col-contenido-trivia">
          <div className="insignia-categoria" id="tipoPregunta">RESULTADO</div>
          <h2 id="pregunta">
            {estado.jugador}, terminaste el nivel {NOMBRES_NIVEL[estado.nivel]}
          </h2>
          <span className="badge text-bg-secondary fs-6">{estado.franquiciaNombre}</span>

          <div aria-live="polite" id="resultado">
            Obtuviste {estado.puntaje} de {total} puntos ({porcentaje}%)
          </div>

          <div
            className="progress w-100"
            role="progressbar"
            aria-label="Porcentaje de aciertos"
            aria-valuenow={porcentaje}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div className={`progress-bar ${colorBarra}`} style={{ width: `${porcentaje}%` }}></div>
          </div>

          <p className="texto-ranking mb-0">Tu partida quedó guardada en el ranking.</p>

          <div className="acciones-resultado">
            <Link className="btn-accion" to={`/jugar/${estado.franquicia}/${estado.nivel}`}>
              Jugar de nuevo
            </Link>
            <Link className="btn-accion btn-secundario" to="/">
              Elegir otro nivel
            </Link>
            <Link className="btn-accion btn-secundario" to="/ranking">
              Ver ranking
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
