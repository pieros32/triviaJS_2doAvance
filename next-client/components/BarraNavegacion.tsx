import Link from 'next/link';
import { useRouter } from 'next/router';

const ENLACES = [
  { href: '/', texto: 'Inicio' },
  { href: '/ranking', texto: 'Ranking' }
];

export default function BarraNavegacion() {
  const { pathname } = useRouter();

  return (
    <nav aria-label="Menú principal">
      <ul className="nav nav-pills justify-content-center gap-2 menu-principal">
        {ENLACES.map(({ href, texto }) => (
          <li className="nav-item" key={href}>
            <Link href={href} className={`nav-link ${pathname === href ? 'active' : ''}`}>
              {texto}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
