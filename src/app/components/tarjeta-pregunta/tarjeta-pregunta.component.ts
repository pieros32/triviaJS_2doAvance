import { NgClass, NgFor } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

import { Pregunta } from '../../models/trivia.models';

// Tarjeta con la pregunta, la imagen y las opciones.
// Comunicación con el componente padre (la página de juego):
//   - Entra información con @Input()  (la pregunta, qué opción se eligió, el mensaje...)
//   - Salen avisos con @Output()      ("el usuario eligió X", "pidió la siguiente")
// La tarjeta NO decide si una respuesta es correcta: eso lo hace QuizService.
@Component({
  selector: 'app-tarjeta-pregunta',
  imports: [NgFor, NgClass],
  templateUrl: './tarjeta-pregunta.component.html'
})
export class TarjetaPreguntaComponent {
  @Input({ required: true }) pregunta!: Pregunta;
  @Input() opciones: string[] = [];
  @Input() seleccionada: string | null = null;
  @Input() respondida = false;
  @Input() mensaje = '';

  @Output() elegir = new EventEmitter<string>();
  @Output() siguiente = new EventEmitter<void>();

  /** La opción correcta se pinta de verde una vez respondida la pregunta. */
  esCorrecta(opcion: string): boolean {
    return this.respondida && opcion === this.pregunta.respuesta;
  }

  /** La opción elegida se pinta de rojo solo si no era la correcta. */
  esIncorrecta(opcion: string): boolean {
    return this.respondida && opcion === this.seleccionada && opcion !== this.pregunta.respuesta;
  }
}
