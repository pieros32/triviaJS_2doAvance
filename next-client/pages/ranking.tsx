import { NIVELES, NOMBRES_NIVEL, esNivel, type Franquicia, type Nivel, type RegistroRanking } from '@trivia/shared';
import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useState } from 'react';

import ErrorCarga from '../components/ErrorCarga';
import { eliminarPartida, obtenerFranquicias, obtenerRanking, vaciarRanking } from '../lib/api';

const COLOR_NIVEL: Record<Nivel, string> = {
  facil: 'text-bg-success',
  intermedio: 'text-bg-warning',
  experto: 'text-bg-danger'
};

interface Props {
  registros: RegistroRanking[];
  franquicias: Franquicia[];
  franquicia: string;
  nivel: Nivel | '';
  error: string;
}

// Renderizado en servidor (SSR): el ranking cambia con cada partida, así que se pide a Express
// en cada visita y la página llega ya con los datos. Los filtros viajan en la URL (?franquicia=&nivel=).
export const getServerSideProps: GetServerSideProps<Props> = async ({ query }) => {
  const franquicia = typeof query.franquicia === 'string' ? query.franquicia : '';
  const nivel = typeof query.nivel === 'string' && esNivel(query.nivel) ? query.nivel : '';
  try {
    const [registros, franquicias] = await Promise.all([obtenerRanking(franquicia, nivel), obtenerFranquicias()]);
    return { props: { registros, franquicias, franquicia, nivel, error: '' } };
  } catch (e) {
    return { props: { registros: [], franquicias: [], franquicia, nivel, error: (e as Error).message } };
  }
};

export default function Ranking({ registros, franquicias, franquicia, nivel, error: errorInicial }: Props) {
  const router = useRouter();
  const [error, setError] = useState(errorInicial);

  // Cambiar un filtro cambia la URL, y Next vuelve a ejecutar getServerSideProps
  function filtrar(cambio: { franquicia?: string; nivel?: string }) {
    const nuevo = { franquicia, nivel, ...cambio };
    const query = Object.fromEntries(Object.entries(nuevo).filter(([, valor]) => valor));
    router.push({ pathname: '/ranking', query });
  }

  // Tras borrar, se vuelve a cargar la misma URL para que el servidor traiga el ranking actualizado
  const recargar = () => router.replace(router.asPath);

  async function borrar(id: string) {
    try {
      await eliminarPartida(id); // DELETE /api/ranking/:id
      setError('');
      await recargar();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  async function borrarHistorial() {
    if (!window.confirm('¿Borrar todo el historial del ranking? Esta acción no se puede deshacer.')) return;
    try {
      await vaciarRanking(); // DELETE /api/ranking
      setError('');
      await router.replace('/ranking');
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <>
      <Head>
        <title>Ranking · ¡TRIVIA POP!</title>
      </Head>
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
                value={franquicia}
                onChange={(e) => filtrar({ franquicia: e.target.value })}
              >
                <option value="">Todas</option>
                {franquicias.map((f) => (
                  <option key={f.id} value={f.slug}>
                    {f.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="etiqueta-configuracion mb-2" htmlFor="filtroNivel">
                Dificultad
              </label>
              <select id="filtroNivel" className="form-select" value={nivel} onChange={(e) => filtrar({ nivel: e.target.value })}>
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

          {error ? (
            <ErrorCarga titulo="Error:" mensaje={error} />
          ) : registros.length === 0 ? (
            <p className="texto-ranking text-center mb-0">Todavía no hay partidas con esos filtros. ¡Juega una para aparecer aquí!</p>
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
                    <th scope="col" style={{ width: '1%' }}>
                      <span className="visually-hidden">Acciones</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {registros.map((r, i) => (
                    <tr key={r.id}>
                      <th scope="row">{i + 1}</th>
                      <td className="fw-bold">{r.jugador}</td>
                      <td>{r.franquiciaNombre}</td>
                      <td>
                        <span className={`badge ${COLOR_NIVEL[r.nivel]}`}>{NOMBRES_NIVEL[r.nivel]}</span>
                      </td>
                      <td className="text-end">
                        {r.puntaje}/{r.total} <span className="text-secondary">({Math.round((r.puntaje / r.total) * 100)}%)</span>
                      </td>
                      <td className="text-end d-none d-md-table-cell">{new Date(r.fecha).toLocaleDateString('es-PE')}</td>
                      <td className="text-end text-nowrap">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger"
                          aria-label={`Borrar la partida de ${r.jugador}`}
                          onClick={() => borrar(r.id)}
                        >
                          Borrar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
