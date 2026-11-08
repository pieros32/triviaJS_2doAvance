import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import 'bootstrap/dist/css/bootstrap.min.css';
import './styles.css';

import App from './App';
import { PartidaProvider } from './context/PartidaContext';

// BrowserRouter activa la navegación; PartidaProvider comparte la partida con todas las pantallas.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <PartidaProvider>
        <App />
      </PartidaProvider>
    </BrowserRouter>
  </StrictMode>
);
