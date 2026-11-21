import { NOMBRES_NIVEL, type Nivel } from '@trivia/shared';

interface Props {
  jugador: string;
  nivel: Nivel;
  numero: number;
  total: number;
  puntaje: number;
  segundos: number;
  completadas: number;
}

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
          <span className="valor-estado">{NOMBRES_NIVEL[nivel]}</span>
        </div>
        <div className="col">
          <span className="etiqueta-estado d-block">Progreso</span>
          <span className="valor-estado">{numero} / {total}</span>
        </div>
        <div className="col">
          <span className="etiqueta-estado d-block">Puntaje</span>
          <span className="valor-estado">{puntaje} pts</span>
        </div>
        <div className="col col-md-auto ms-md-auto">
          <span className="etiqueta-estado d-block">Tiempo</span>
          <span className={`valor-estado valor-tiempo ${urgente ? 'text-danger' : ''}`}>{segundos} s</span>
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
