import { Route, Routes } from 'react-router-dom';

import BarraNavegacion from './components/BarraNavegacion';
import Encabezado from './components/Encabezado';
import Inicio from './pages/Inicio';
import Juego from './pages/Juego';
import NoEncontrada from './pages/NoEncontrada';
import Ranking from './pages/Ranking';
import Resultado from './pages/Resultado';

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
