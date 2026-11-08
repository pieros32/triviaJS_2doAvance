import { vistaInicio, vistaJuego, vistaResultado } from './vistas.js';

// ============================================================
// NAVEGACIÓN (router mínimo basado en el hash de la URL)
//
//   #/                           → elegir franquicia y dificultad
//   #/jugar/:franquicia/:nivel   → la trivia
//   #/resultado                  → puntaje final
//   cualquier otra cosa          → vuelve al inicio
// ============================================================
const contenedor = document.getElementById('vista');

function navegar(ruta) {
  location.hash = '#' + ruta;
}

function enrutar() {
  const partes = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean).map(decodeURIComponent);

  if (partes.length === 0) {
    vistaInicio(contenedor, navegar);
  } else if (partes[0] === 'jugar' && partes.length === 3) {
    vistaJuego(contenedor, navegar, partes[1], partes[2]);
  } else if (partes[0] === 'resultado' && partes.length === 1) {
    vistaResultado(contenedor, navegar);
  } else {
    navegar('/');
  }
}

window.addEventListener('hashchange', enrutar);
enrutar();
