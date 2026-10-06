import { Component, Input } from '@angular/core';

import { Nivel } from '../../models/trivia.models';
import { NivelNombrePipe } from '../../pipes/nivel-nombre.pipe';

// Barra con Nivel / Progreso / Puntaje. Solo muestra lo que le llega por @Input();
// no sabe nada de preguntas ni de servicios (componente "tonto" y reutilizable).
@Component({
  selector: 'app-barra-estado',
  imports: [NivelNombrePipe],
  templateUrl: './barra-estado.component.html'
})
export class BarraEstadoComponent {
  @Input() nivel: Nivel | null = null;
  @Input() numero = 0;
  @Input() total = 0;
  @Input() puntaje = 0;
}
