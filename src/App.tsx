import { NIVELES, NOMBRES_NIVEL } from './models/trivia';

// Componente raíz. Por ahora solo comprueba que React + TSX + Bootstrap funcionan;
// aquí se irán montando el encabezado, la navegación y las pantallas.
export default function App() {
  return (
    <>
      <main className="aplicacion-trivia">
        <header className="encabezado-app">
          <div className="insignia-marca">POP CULTURE QUIZ ARENA</div>
          <h1 className="titulo-app">
            ¡TRIVIA POP! <span className="acento-titulo">CINE &amp; SERIES</span>
          </h1>
        </header>

        <p className="estado-carga">
          React listo. Niveles: {NIVELES.map((n) => NOMBRES_NIVEL[n]).join(', ')}
        </p>
      </main>

      <footer className="pie-app">
        <p className="pie-principal">Cine &amp; Series Trivia • Desarrollado para JavaScript Avanzado</p>
        <p className="pie-secundario">PROYECTO ACADÉMICO — MODO POP CULTURE QUIZ</p>
      </footer>
    </>
  );
}
