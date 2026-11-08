import { useState } from 'react';
import { Link } from 'react-router-dom';

import { NIVELES, NOMBRES_NIVEL, type Nivel } from '../models/trivia';
import { cargarRanking, limpiarRanking, ordenarRanking, porcentaje } from '../utils/ranking';

const COLOR_NIVEL: Record<Nivel, string> = {
  facil: 'text-bg-success',
  intermedio: 'text-bg-warning',
  experto: 'text-bg-danger'
};

export default function Ranking() {
  const [registros, setRegistros] = useState(cargarRanking);
  const [filtroFranquicia, setFiltroFranquicia] = useState('');
  const [filtroNivel, setFiltroNivel] = useState('');

  const franquicias = [...new Map(registros.map((r) => [r.franquicia, r.franquiciaNombre]))];

  const visibles = ordenarRanking(
    registros.filter(
      (r) => (!filtroFranquicia || r.franquicia === filtroFranquicia) && (!filtroNivel || r.nivel === filtroNivel)
    )
  ).slice(0, 20);

  function borrarHistorial() {
    if (window.confirm('¿Borrar todo el historial del ranking? Esta acción no se puede deshacer.')) {
      limpiarRanking();
      setRegistros([]);
      setFiltroFranquicia('');
      setFiltroNivel('');
    }
  }

  if (registros.length === 0) {
    return (
      <div className="pantalla">
        <section className="panel-ranking text-center">
          <h2 className="titulo-seccion">Ranking</h2>
          <p className="texto-ranking">Todavía no hay partidas guardadas. ¡Juega una para aparecer aquí!</p>
          <Link className="btn-accion" to="/">
            Jugar ahora
          </Link>
        </section>
      </div>
    );
  }

  return (
    <div className="pantalla">
      <section className="panel-ranking">
        <h2 className="titulo-seccion">Ranking</h2>

        <form className="row g-3 mb-4" aria-label="Filtros del ranking" onSubmit={(e) => e.preventDefault()}>
          <div className="col-md-5">
            <label className="etiqueta-configuracion mb-2" htmlFor="filtroFranquicia">
              Franquicia
            </label>
            <select
              id="filtroFranquicia"
              className="form-select"
              value={filtroFranquicia}
              onChange={(e) => setFiltroFranquicia(e.target.value)}
            >
              <option value="">Todas</option>
              {franquicias.map(([slug, nombre]) => (
                <option key={slug} value={slug}>
                  {nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-4">
            <label className="etiqueta-configuracion mb-2" htmlFor="filtroNivel">
              Dificultad
            </label>
            <select
              id="filtroNivel"
              className="form-select"
              value={filtroNivel}
              onChange={(e) => setFiltroNivel(e.target.value)}
            >
              <option value="">Todas</option>
              {NIVELES.map((n) => (
                <option key={n} value={n}>
                  {NOMBRES_NIVEL[n]}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3 d-flex align-items-end">
            <button type="button" className="btn btn-outline-danger w-100" onClick={borrarHistorial}>
              Borrar historial
            </button>
          </div>
        </form>

        {visibles.length === 0 ? (
          <p className="texto-ranking text-center mb-0">No hay partidas con esos filtros.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-striped table-hover align-middle mb-0">
              <thead>
                <tr>
                  <th scope="col">#</th>
                  <th scope="col">Jugador</th>
                  <th scope="col">Franquicia</th>
                  <th scope="col">Nivel</th>
                  <th scope="col" className="text-end">Puntaje</th>
                  <th scope="col" className="text-end d-none d-md-table-cell">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {visibles.map((r, i) => (
                  <tr key={r.id}>
                    <th scope="row">{i + 1}</th>
                    <td className="fw-bold">{r.jugador}</td>
                    <td>{r.franquiciaNombre}</td>
                    <td>
                      <span className={`badge ${COLOR_NIVEL[r.nivel]}`}>{NOMBRES_NIVEL[r.nivel]}</span>
                    </td>
                    <td className="text-end">
                      {r.puntaje}/{r.total} <span className="text-secondary">({porcentaje(r)}%)</span>
                    </td>
                    <td className="text-end d-none d-md-table-cell">
                      {new Date(r.fecha).toLocaleDateString('es-PE')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
