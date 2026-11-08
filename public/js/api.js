// Acceso al backend (json-server, db.json). Solo lectura (GET).
//   GET /franquicias
//   GET /preguntas?franquicia=the-walking-dead&nivel=facil
const API = 'http://localhost:3000';

async function pedir(ruta, params) {
  const url = new URL(API + ruta);
  if (params) {
    Object.entries(params).forEach(([clave, valor]) => url.searchParams.set(clave, valor));
  }
  const respuesta = await fetch(url);
  if (!respuesta.ok) {
    throw new Error(`HTTP ${respuesta.status}`);
  }
  return respuesta.json();
}

export function obtenerFranquicias() {
  return pedir('/franquicias');
}

export function obtenerPreguntas(franquicia, nivel) {
  return pedir('/preguntas', { franquicia, nivel });
}
