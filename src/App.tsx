import { Route, Routes } from 'react-router-dom';

import BarraNavegacion from './components/BarraNavegacion';
import Encabezado from './components/Encabezado';
import Inicio from './pages/Inicio';
import Juego from './pages/Juego';
import NoEncontrada from './pages/NoEncontrada';
import Ranking from './pages/Ranking';
import Resultado from './pages/Resultado';

// ============================================================
// COMPONENTE RAÍZ + NAVEGACIÓN
// El encabezado y el menú se ven siempre; <Routes> dibuja
// solo la pantalla que corresponde a la URL:
//   /                           → formulario: nombre, franquicia y dificultad
//   /jugar/:franquicia/:nivel   → la trivia (":franquicia" y ":nivel" vienen de la URL)
//   /resultado                  → puntaje final
//   /ranking                    → historial de partidas con filtros
//   cualquier otra              → página no encontrada
// ============================================================
export default function App() {
  return (
    <>
      <main className="aplicacion-trivia">
        <Encabezado />
        <BarraNavegacion />

        <Routes>
          <Route path="/" element={<Inicio />} />
          <Route path="/jugar/:franquicia/:nivel" element={<Juego />} />
          <Route path="/resultado" element={<Resultado />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="*" element={<NoEncontrada />} />
        </Routes>
      </main>
    </>
  );
}
