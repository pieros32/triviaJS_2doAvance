import { NOMBRES_NIVEL } from '@trivia/shared';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

import { usePartida } from '../context/PartidaContext';
import Cargando from './Cargando';

export default function Resultado() {
  const router = useRouter();
  const partida = usePartida();

  // Sin una partida terminada (por ejemplo al recargar) se vuelve al inicio
  useEffect(() => {
    if (!partida.terminada) router.replace('/');
  }, [router, partida.terminada]);

  if (!partida.terminada || !partida.nivel) {
    return <Cargando />;
  }

  const total = partida.preguntas.length;
  const porcentaje = total > 0 ? Math.round((partida.puntaje / total) * 100) : 0;
  const colorBarra = porcentaje >= 70 ? 'bg-success' : porcentaje >= 40 ? 'bg-warning' : 'bg-danger';

  return (
    <div className="pantalla">
      <article className="tarjeta-trivia tarjeta-resultado">
        <div className="col-contenido-trivia">
          <div className="insignia-categoria" id="tipoPregunta">RESULTADO</div>
          <h2 id="pregunta">
            {partida.jugador}, terminaste el nivel {NOMBRES_NIVEL[partida.nivel]}
          </h2>
          <span className="badge text-bg-secondary fs-6">{partida.franquiciaNombre}</span>

          <div aria-live="polite" id="resultado">
            Obtuviste {partida.puntaje} de {total} puntos ({porcentaje}%)
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

          <div className="d-flex align-items-center" style={{ minHeight: '2.6rem' }}>
            {partida.guardado === 'ok' && <p className="texto-ranking mb-0">Tu partida quedó guardada en el ranking.</p>}
            {partida.guardado === 'guardando' && <p className="texto-ranking mb-0">Guardando en el ranking…</p>}
            {partida.guardado === 'error' && (
              <div className="alert alert-warning mb-0" role="alert">
                No se pudo guardar en el ranking.
                <button type="button" className="btn btn-sm btn-outline-warning ms-2" onClick={() => partida.guardar()}>
                  Reintentar
                </button>
              </div>
            )}
          </div>

          <div className="acciones-resultado">
            <Link className="btn-accion" href={`/jugar/${partida.franquicia}/${partida.nivel}`}>
              Jugar de nuevo
            </Link>
            <Link className="btn-accion btn-secundario" href="/">
              Elegir otro nivel
            </Link>
            <Link className="btn-accion btn-secundario" href="/ranking">
              Ver ranking
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
