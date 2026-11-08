import type { Pregunta } from '../models/trivia';

interface Props {
  pregunta: Pregunta;
  opciones: string[];
  seleccionada: string | null;
  respondida: boolean;
  mensaje: string;
  esUltima: boolean;
  onElegir: (opcion: string) => void;
  onSiguiente: () => void;
}

// Tarjeta con la pregunta, la imagen y las opciones.
// Recibe todo por props y avisa al padre con funciones (onElegir, onSiguiente):
// NO decide si una respuesta es correcta, eso lo hace el reducer de la partida.
export default function TarjetaPregunta({
  pregunta,
  opciones,
  seleccionada,
  respondida,
  mensaje,
  esUltima,
  onElegir,
  onSiguiente
}: Props) {
  // Color del mensaje con utilidades de Bootstrap
  let colorMensaje = 'text-warning'; // aviso: "debes responder..."
  if (respondida) {
    colorMensaje = seleccionada === pregunta.respuesta ? 'text-success' : 'text-danger';
  }

  // La columna visual solo existe si la pregunta trae imagen o tipo.
  // Sin ninguno de los dos no se dibuja nada y la tarjeta queda en una columna.
  const tieneVisual = Boolean(pregunta.imagen || pregunta.tipo);

  return (
    <article className={`tarjeta-trivia arena-cuestionario ${tieneVisual ? '' : 'sin-visual'}`}>
      {/* Columna izquierda (opcional): categoría e imagen */}
      {tieneVisual && (
        <div className="col-visual-trivia">
          {pregunta.tipo && <div className="insignia-categoria" id="tipoPregunta">{pregunta.tipo}</div>}
          {pregunta.imagen && (
            <div className="marco-imagen">
              <img alt="Imagen representativa de la pregunta" id="imagenPregunta" src={`/${pregunta.imagen}`} />
            </div>
          )}
        </div>
      )}

      {/* Columna derecha: pregunta, opciones, mensaje y botón */}
      <div className="col-contenido-trivia">
        <h2 id="pregunta">{pregunta.pregunta}</h2>

        <div id="opciones" role="group" aria-label="Opciones de respuesta">
          {opciones.map((opcion) => {
            const correcta = respondida && opcion === pregunta.respuesta;
            const incorrecta = respondida && opcion === seleccionada && opcion !== pregunta.respuesta;
            return (
              <button
                key={opcion}
                type="button"
                className={`opcion-btn ${correcta ? 'correcta' : ''} ${incorrecta ? 'incorrecta' : ''}`}
                disabled={respondida}
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
