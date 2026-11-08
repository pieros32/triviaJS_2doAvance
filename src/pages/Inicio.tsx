import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';

import Cargando from '../components/Cargando';
import ErrorCarga from '../components/ErrorCarga';
import { usePartida } from '../context/PartidaContext';
import { NIVELES, NOMBRES_NIVEL, type Franquicia, type Nivel } from '../models/trivia';
import { obtenerFranquicias } from '../services/api';

const NOMBRE_MIN = 2;
const NOMBRE_MAX = 20;

export default function Inicio() {
  const navigate = useNavigate();
  const { estado, configurar } = usePartida();

  const [franquicias, setFranquicias] = useState<Franquicia[]>([]);
  const [cargando, setCargando] = useState(true);
  const [errorConexion, setErrorConexion] = useState(false);

  const [nombre, setNombre] = useState(estado.jugador);
  const [franquicia, setFranquicia] = useState('');
  const [nivel, setNivel] = useState<Nivel | ''>('');
  const [intentado, setIntentado] = useState(false);

  useEffect(() => {
    let activo = true; // evita actualizar el estado si ya se desmontó
    obtenerFranquicias()
      .then((lista) => {
        if (!activo) return;
        setFranquicias(lista);
        setFranquicia(lista[0]?.slug ?? '');
      })
      .catch(() => {
        if (activo) setErrorConexion(true);
      })
      .finally(() => {
        if (activo) setCargando(false);
      });
    return () => {
      activo = false;
    };
  }, []);

  const nombreLimpio = nombre.trim();
  const errorNombre =
    nombreLimpio.length < NOMBRE_MIN
      ? `Escribe al menos ${NOMBRE_MIN} caracteres.`
      : nombreLimpio.length > NOMBRE_MAX
        ? `Máximo ${NOMBRE_MAX} caracteres.`
        : '';
  const errorNivel = nivel === '' ? 'Elige una dificultad.' : '';
  const hayErrores = Boolean(errorNombre || errorNivel || !franquicia);

  function comenzar(evento: FormEvent) {
    evento.preventDefault();
    setIntentado(true);
    if (hayErrores || nivel === '') {
      return;
    }
    const elegida = franquicias.find((f) => f.slug === franquicia);
    configurar(nombreLimpio, elegida?.nombre ?? franquicia);
    navigate(`/jugar/${franquicia}/${nivel}`);
  }

  if (cargando) {
    return <Cargando texto="Cargando franquicias…" />;
  }

  return (
    <div className="pantalla">
      {errorConexion && (
        <ErrorCarga
          titulo="Error de conexión:"
          mensaje="No se pudo contactar con el servidor de preguntas. Verifica que json-server esté encendido (npm start) y recarga la página."
        />
      )}

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
    </div>
  );
}
