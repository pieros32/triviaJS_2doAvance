import { NIVELES, NOMBRE_MAX, NOMBRE_MIN, NOMBRES_NIVEL, type Franquicia, type Nivel } from '@trivia/shared';
import { useRouter } from 'next/router';
import { useState, type FormEvent } from 'react';

import { usePartida } from '../context/PartidaContext';

export default function FormularioInicio({ franquicias }: { franquicias: Franquicia[] }) {
  const router = useRouter();
  const partida = usePartida();

  const [nombre, setNombre] = useState(partida.jugador);
  const [franquicia, setFranquicia] = useState(franquicias[0]?.slug ?? '');
  const [nivel, setNivel] = useState<Nivel | ''>('');
  const [intentado, setIntentado] = useState(false);

  const largo = nombre.trim().length;
  const errorNombre =
    largo < NOMBRE_MIN ? `Escribe al menos ${NOMBRE_MIN} caracteres.` : largo > NOMBRE_MAX ? `Máximo ${NOMBRE_MAX} caracteres.` : '';
  const errorNivel = nivel === '' ? 'Elige una dificultad.' : '';
  const hayErrores = Boolean(errorNombre || errorNivel || !franquicia);

  function comenzar(evento: FormEvent) {
    evento.preventDefault();
    setIntentado(true);
    if (hayErrores) return;

    const elegida = franquicias.find((f) => f.slug === franquicia);
    partida.configurar(nombre.trim(), elegida?.nombre ?? franquicia);
    router.push(`/jugar/${franquicia}/${nivel}`);
  }

  return (
    <form className="panel-configuracion" aria-label="Configuración de la trivia" onSubmit={comenzar} noValidate>
      <div className="row g-4">
        <div className="col-md-6">
          <label className="etiqueta-configuracion mb-2" htmlFor="campoNombre">
            Nombre del jugador
          </label>
          <input
            id="campoNombre"
            type="text"
            className={`form-control form-control-lg ${intentado && errorNombre ? 'is-invalid' : ''}`}
            placeholder="Ej. Rick"
            autoComplete="off"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
          <div className="invalid-feedback">{errorNombre}</div>
        </div>

        <div className="col-md-6">
          <label className="etiqueta-configuracion mb-2" htmlFor="selectorFranquicia">
            Selecciona una Franquicia
          </label>
          <select
            id="selectorFranquicia"
            className="form-select form-select-lg"
            value={franquicia}
            onChange={(e) => setFranquicia(e.target.value)}
          >
            {franquicias.map((f) => (
              <option key={f.id} value={f.slug}>
                {f.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="col-12">
          <span className="etiqueta-configuracion d-block mb-2">Dificultad</span>
          <div className="row g-2" role="group" aria-label="Dificultad">
            {NIVELES.map((n) => (
              <div className="col-4" key={n}>
                <button
                  type="button"
                  className={`btn btn-nivel w-100 ${nivel === n ? 'activo' : ''}`}
                  aria-pressed={nivel === n}
                  onClick={() => setNivel(n)}
                >
                  {NOMBRES_NIVEL[n]}
                </button>
              </div>
            ))}
          </div>
          {intentado && errorNivel && <div className="text-danger small mt-2">{errorNivel}</div>}
        </div>

        <div className="col-12">
          <button type="submit" className="btn-accion" disabled={franquicias.length === 0}>
            Comenzar
          </button>
        </div>
      </div>
    </form>
  );
}
