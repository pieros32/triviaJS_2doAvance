import { NavLink } from 'react-router-dom';

// Menú principal. NavLink marca con la clase "active" el enlace de la página actual.
// Las clases nav / nav-pills / nav-link son de Bootstrap.
export default function BarraNavegacion() {
  const clase = ({ isActive }: { isActive: boolean }) => `nav-link ${isActive ? 'active' : ''}`;

  return (
    <nav aria-label="Menú principal">
      <ul className="nav nav-pills justify-content-center gap-2 menu-principal">
        <li className="nav-item">
          <NavLink to="/" end className={clase}>
            Inicio
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink to="/ranking" className={clase}>
            Ranking
          </NavLink>
        </li>
      </ul>
    </nav>
  );
}
