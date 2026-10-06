import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { EncabezadoComponent } from './components/encabezado/encabezado.component';

// Componente raíz: el "marco" de la app. El encabezado y el pie se ven siempre;
// lo que cambia según la URL se dibuja donde está <router-outlet>.
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, EncabezadoComponent],
  templateUrl: './app.component.html'
})
export class AppComponent {}
