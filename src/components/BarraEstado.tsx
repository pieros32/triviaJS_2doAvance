import { NOMBRES_NIVEL, type Nivel } from '../models/trivia';

interface Props {
  jugador: string;
  nivel: Nivel | null;
  numero: number;
  total: number;
  puntaje: number;
  segundos: number;
  /** Preguntas ya terminadas (para la barra de avance). */
  completadas: number;
}

// Marcador de la partida. Solo muestra lo que recibe por props: no sabe nada del juego.
// La grilla (row/col) y la barra de avance (progress) son de Bootstrap.
export default function BarraEstado({ jugador, nivel, numero, total, puntaje, segundos, completadas }: Props) {
  const avance = total > 0 ? Math.round((completadas / total) * 100) : 0;
  const urgente = segundos <= 5;

  return (
    <section aria-live="polite" className="barra-estado barra-hud">
      <div className="row row-cols-2 row-cols-md-5 g-3 text-center text-md-start">
        <div className="col">
          <span className="etiqueta-estado d-block">Jugador</span>
          <span className="valor-estado valor-jugador">{jugador}</span>
        </div>
        <div className="col">
          <span className="etiqueta-estado d-block">Nivel</span>
          <span className="valor-estado" id="nivelActual">{nivel ? NOMBRES_NIVEL[nivel] : '—'}</span>
        </div>
        <div className="col">
          <span className="etiqueta-estado d-block">Progreso</span>
          <span className="valor-estado" id="numeroPregunta">{numero} / {total}</span>
        </div>
        <div className="col">
          <span className="etiqueta-estado d-block">Puntaje</span>
          <span className="valor-estado" id="puntaje">{puntaje} pts</span>
        </div>
        <div className="col col-md-auto ms-md-auto">
          <span className="etiqueta-estado d-block">Tiempo</span>
          <span className={`valor-estado valor-tiempo ${urgente ? 'text-danger' : ''}`}>{Math.max(segundos, 0)} s</span>
        </div>
      </div>

      <div
        className="progress mt-3"
        role="progressbar"
        aria-label="Avance de la partida"
        aria-valuenow={avance}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="progress-bar barra-avance" style={{ width: `${avance}%` }}></div>
      </div>
    </section>
  );
}
