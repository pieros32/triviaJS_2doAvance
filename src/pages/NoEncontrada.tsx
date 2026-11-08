import { Link } from 'react-router-dom';

export default function NoEncontrada() {
  return (
    <div className="pantalla">
      <section className="panel-ranking text-center">
        <h2 className="titulo-seccion">Página no encontrada</h2>
        <p className="texto-ranking">La dirección que escribiste no existe.</p>
        <Link className="btn-accion" to="/">
          Volver al inicio
        </Link>
      </section>
    </div>
  );
}
