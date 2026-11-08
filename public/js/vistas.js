import { obtenerFranquicias, obtenerPreguntas } from './api.js';
import { quiz } from './quiz.js';
import { NIVELES, esc, esNivel, nombreNivel } from './utils.js';

// ============================================================
// "Componentes" como funciones que devuelven HTML (texto).
// ============================================================
function errorCarga(titulo, mensaje) {
  return `
    <div id="errorCarga" role="alert">
      <svg fill="none" height="24" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" width="24">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" x2="12" y1="8" y2="12"></line>
        <line x1="12" x2="12.01" y1="16" y2="16"></line>
      </svg>
      <div><strong>${esc(titulo)}</strong> ${esc(mensaje)}</div>
    </div>`;
}

function barraEstado() {
  return `
    <div aria-live="polite" class="barra-estado barra-hud">
      <div class="elemento-estado">
        <span class="etiqueta-estado">Nivel</span>
        <span class="valor-estado" id="nivelActual">${nombreNivel(quiz.nivel)}</span>
      </div>
      <div class="elemento-estado">
        <span class="etiqueta-estado">Progreso</span>
        <span class="valor-estado" id="numeroPregunta">${quiz.indice + 1} / ${quiz.total}</span>
      </div>
      <div class="elemento-estado">
        <span class="etiqueta-estado">Puntaje</span>
        <span class="valor-estado" id="puntaje">${quiz.puntaje} pts</span>
      </div>
    </div>`;
}

function tarjetaPregunta(pregunta, { seleccionada, respondida, mensaje }) {
  const opciones = quiz.opcionesActuales
    .map((opcion, i) => {
      const correcta = respondida && opcion === pregunta.respuesta;
      const incorrecta = respondida && opcion === seleccionada && opcion !== pregunta.respuesta;
      const clases = ['opcion-btn', correcta ? 'correcta' : '', incorrecta ? 'incorrecta' : '']
        .filter(Boolean)
        .join(' ');
      return `<button type="button" class="${clases}" data-opcion="${i}" ${respondida ? 'disabled' : ''}>${esc(opcion)}</button>`;
    })
    .join('');

  return `
    <article class="tarjeta-trivia arena-cuestionario">
      <div class="col-visual-trivia">
        <div class="insignia-categoria" id="tipoPregunta">${esc(pregunta.tipo)}</div>
        <div class="marco-imagen">
          <img alt="Imagen representativa de la pregunta" id="imagenPregunta" src="${esc(pregunta.imagen)}" />
        </div>
      </div>
      <div class="col-contenido-trivia">
        <h2 id="pregunta">${esc(pregunta.pregunta)}</h2>
        <div id="opciones" role="group" aria-label="Opciones de respuesta">${opciones}</div>
        <div aria-live="assertive" id="resultado">${esc(mensaje)}</div>
        <button id="siguiente" type="button">
          <span>Siguiente Pregunta</span>
          <svg fill="none" height="22" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" width="22">
            <line x1="5" x2="19" y1="12" y2="12"></line>
            <polyline points="12 5 19 12 12 19"></polyline>
          </svg>
        </button>
      </div>
    </article>`;
}

// ============================================================
// PÁGINA DE INICIO  (#/)
// ============================================================
export async function vistaInicio(contenedor, navegar) {
  let franquicias = [];
  let errorConexion = false;
  const formulario = { franquicia: '', nivel: '' };

  try {
    franquicias = await obtenerFranquicias();
    formulario.franquicia = franquicias[0]?.slug ?? '';
  } catch {
    errorConexion = true;
  }

  const opcionesFranquicia = franquicias
    .map((f) => `<option value="${esc(f.slug)}">${esc(f.nombre)}</option>`)
    .join('');
  const botonesNivel = NIVELES
    .map((n) => `<button type="button" class="btn-nivel" data-nivel="${n}">${nombreNivel(n)}</button>`)
    .join('');

  contenedor.innerHTML = `
    ${errorConexion
      ? errorCarga('Error de conexión:', 'No se pudo contactar con el servidor de preguntas. Verifica que json-server esté encendido (npm start) y recarga la página.')
      : ''}
    <form class="panel-configuracion panel-controles" aria-label="Configuración de la trivia">
      <div class="grupo-configuracion">
        <label class="etiqueta-configuracion" for="selectorFranquicia">
          <svg fill="none" height="15" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24" width="15">
            <rect height="20" rx="2.18" ry="2.18" width="20" x="2" y="2"></rect>
            <line x1="7" x2="7" y1="2" y2="22"></line>
            <line x1="17" x2="17" y1="2" y2="22"></line>
            <line x1="2" x2="22" y1="12" y2="12"></line>
            <line x1="2" x2="7" y1="7" y2="7"></line>
            <line x1="2" x2="7" y1="17" y2="17"></line>
            <line x1="17" x2="22" y1="17" y2="17"></line>
            <line x1="17" x2="22" y1="7" y2="7"></line>
          </svg>
          Selecciona una Franquicia
        </label>
        <div class="contenedor-selector">
          <select id="selectorFranquicia">${opcionesFranquicia}</select>
        </div>
      </div>

      <div class="grupo-configuracion">
        <span class="etiqueta-configuracion">
          <svg fill="none" height="15" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24" width="15">
            <circle cx="12" cy="12" r="10"></circle>
            <polygon points="12 6 12 12 16 14"></polygon>
          </svg>
          Dificultad
        </span>
        <div class="cuadricula-niveles">${botonesNivel}</div>
      </div>

      <div class="accion-formulario">
        <button type="submit" class="btn-accion" id="btnComenzar" disabled>Comenzar</button>
      </div>
    </form>`;

  const form = contenedor.querySelector('form');
  const selector = contenedor.querySelector('#selectorFranquicia');
  const btnComenzar = contenedor.querySelector('#btnComenzar');
  const botones = contenedor.querySelectorAll('.btn-nivel');

  const actualizar = () => {
    botones.forEach((b) => b.classList.toggle('activo', b.dataset.nivel === formulario.nivel));
    btnComenzar.disabled = !formulario.franquicia || !formulario.nivel;
  };

  selector.addEventListener('change', () => {
    formulario.franquicia = selector.value;
    actualizar();
  });
  botones.forEach((b) =>
    b.addEventListener('click', () => {
      formulario.nivel = b.dataset.nivel;
      actualizar();
    })
  );
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (formulario.franquicia && formulario.nivel) {
      navegar(`/jugar/${formulario.franquicia}/${formulario.nivel}`);
    }
  });
  actualizar();
}

// ============================================================
// PÁGINA DE JUEGO  (#/jugar/:franquicia/:nivel)
// ============================================================
export async function vistaJuego(contenedor, navegar, franquicia, nivel) {
  quiz.reiniciar();

  const volver = '<a class="btn-accion btn-secundario" href="#/">Volver al inicio</a>';

  if (!esNivel(nivel)) {
    contenedor.innerHTML =
      errorCarga('Nivel no válido:', 'El nivel solicitado no existe. Elige Fácil, Intermedio o Experto.') + volver;
    return;
  }

  contenedor.innerHTML = '<p class="estado-carga">Cargando preguntas…</p>';

  let preguntas;
  try {
    preguntas = await obtenerPreguntas(franquicia, nivel);
  } catch {
    contenedor.innerHTML =
      errorCarga('Error de conexión:', 'No se pudieron cargar las preguntas. Verifica que json-server esté encendido (npm start) y vuelve a intentarlo.') + volver;
    return;
  }

  if (preguntas.length === 0) {
    contenedor.innerHTML =
      errorCarga('Sin preguntas:', 'Esta franquicia todavía no tiene preguntas cargadas. Elige otra franquicia.') + volver;
    return;
  }

  quiz.iniciar(franquicia, nivel, preguntas);

  // Estado de la pregunta que se está mostrando
  let respondida = false;
  let seleccionada = null;
  let mensaje = '';

  const dibujar = () => {
    contenedor.innerHTML =
      barraEstado() + tarjetaPregunta(quiz.preguntaActual, { seleccionada, respondida, mensaje });

    contenedor.querySelectorAll('.opcion-btn').forEach((btn) =>
      btn.addEventListener('click', () => elegirOpcion(quiz.opcionesActuales[Number(btn.dataset.opcion)]))
    );
    contenedor.querySelector('#siguiente').addEventListener('click', siguientePregunta);
  };

  const elegirOpcion = (opcion) => {
    if (respondida) {
      return;
    }
    respondida = true;
    seleccionada = opcion;
    const acerto = quiz.responder(opcion);
    mensaje = acerto
      ? '¡Respuesta correcta!'
      : `Respuesta incorrecta. La respuesta era ${quiz.preguntaActual.respuesta}`;
    dibujar();
  };

  const siguientePregunta = () => {
    // Obliga a responder antes de continuar
    if (!respondida) {
      mensaje = 'Debes responder la pregunta actual para continuar.';
      dibujar();
      return;
    }
    if (quiz.avanzar()) {
      respondida = false;
      seleccionada = null;
      mensaje = '';
      dibujar();
    } else {
      navegar('/resultado');
    }
  };

  dibujar();
}

// ============================================================
// PÁGINA DE RESULTADO  (#/resultado)
// ============================================================
export function vistaResultado(contenedor, navegar) {
  // Si alguien abre #/resultado directamente (sin haber jugado), vuelve al inicio.
  if (!quiz.terminado) {
    navegar('/');
    return;
  }

  const porcentaje = quiz.total > 0 ? Math.round((quiz.puntaje / quiz.total) * 100) : 0;

  contenedor.innerHTML = `
    <article class="tarjeta-trivia tarjeta-resultado">
      <div class="col-contenido-trivia">
        <div class="insignia-categoria" id="tipoPregunta">RESULTADO</div>
        <h2 id="pregunta">Terminaste el nivel ${nombreNivel(quiz.nivel)}</h2>
        <div aria-live="polite" id="resultado">
          Obtuviste ${quiz.puntaje} de ${quiz.total} puntos (${porcentaje}%)
        </div>
        <div class="acciones-resultado">
          <a class="btn-accion" href="#/jugar/${encodeURIComponent(quiz.franquicia)}/${quiz.nivel}">Jugar de nuevo</a>
          <a class="btn-accion btn-secundario" href="#/">Elegir otro nivel</a>
        </div>
      </div>
    </article>`;
}
