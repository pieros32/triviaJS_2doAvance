import { Routes } from '@angular/router';

import { InicioComponent } from './pages/inicio/inicio.component';
import { JuegoComponent } from './pages/juego/juego.component';
import { ResultadoComponent } from './pages/resultado/resultado.component';

// ============================================================
// NAVEGACIÓN (Router)
// Cada ruta muestra un componente dentro del <router-outlet> de app.component.html.
//
//   /                            → elegir franquicia y dificultad (formulario)
//   /jugar/:franquicia/:nivel    → la trivia (":franquicia" y ":nivel" son parámetros de la URL)
//   /resultado                   → puntaje final
// ============================================================
export const routes: Routes = [
  { path: '', component: InicioComponent },
  { path: 'jugar/:franquicia/:nivel', component: JuegoComponent },
  { path: 'resultado', component: ResultadoComponent },
  { path: '**', redirectTo: '' } // cualquier otra URL vuelve al inicio
];
