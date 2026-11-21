import type { PreguntaPublica } from '@trivia/shared';

import { urlImagen } from '../lib/api';

interface Props {
  pregunta: PreguntaPublica;
  seleccionada: string | null;
  /** Respuesta correcta; es null mientras la pregunta sigue abierta. */
  correcta: string | null;
  bloqueada: boolean;
  mensaje: string;
  colorMensaje: string;
  esUltima: boolean;
  onElegir: (opcion: string) => void;
  onSiguiente: () => void;
}

export default function TarjetaPregunta({
  pregunta,
  seleccionada,
  correcta,
  bloqueada,
  mensaje,
  colorMensaje,
  esUltima,
  onElegir,
  onSiguiente
}: Props) {
  // Sin imagen ni tipo no se dibuja la columna visual
  const tieneVisual = Boolean(pregunta.imagen || pregunta.tipo);
  const revelada = correcta !== null;

  return (
    <article className={`tarjeta-trivia arena-cuestionario ${tieneVisual ? '' : 'sin-visual'}`}>
      {tieneVisual && (
        <div className="col-visual-trivia">
          {pregunta.tipo && <div className="insignia-categoria" id="tipoPregunta">{pregunta.tipo}</div>}
          {pregunta.imagen && (
            <div className="marco-imagen">
              {/* <img> a propósito: la imagen la sirve Express desde otro origen */}
              <img alt="Imagen representativa de la pregunta" id="imagenPregunta" src={urlImagen(pregunta.imagen)} />
            </div>
          )}
        </div>
      )}

      <div className="col-contenido-trivia">
        <h2 id="pregunta">{pregunta.pregunta}</h2>

        <div id="opciones" role="group" aria-label="Opciones de respuesta">
          {pregunta.opciones.map((opcion) => {
            const esCorrecta = revelada && opcion === correcta;
            const esIncorrecta = revelada && opcion === seleccionada && opcion !== correcta;
            return (
              <button
                key={opcion}
                type="button"
                className={`opcion-btn ${esCorrecta ? 'correcta' : ''} ${esIncorrecta ? 'incorrecta' : ''}`}
                disabled={bloqueada}
                onClick={() => onElegir(opcion)}
              >
                {opcion}
              </button>
            );
          })}
        </div>

        <div aria-live="assertive" id="resultado" className={colorMensaje}>{mensaje}</div>

        <button id="siguiente" type="button" onClick={onSiguiente}>
          <span>{esUltima ? 'Ver resultado' : 'Siguiente Pregunta'}</span>
          <svg fill="none" height="22" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24" width="22">
            <line x1="5" x2="19" y1="12" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </article>
  );
}
