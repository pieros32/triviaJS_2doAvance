import { NavLink } from 'react-router-dom';

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
