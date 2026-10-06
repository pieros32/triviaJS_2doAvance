import { Component, Input } from '@angular/core';

// Banner de error reutilizable. Recibe el texto desde el componente padre con @Input():
//   <app-error-carga titulo="Error:" mensaje="Algo salió mal" />
// Ya no se muestra/oculta con una clase CSS: el padre lo crea con *ngIf solo cuando hay error.
@Component({
  selector: 'app-error-carga',
  templateUrl: './error-carga.component.html'
})
export class ErrorCargaComponent {
  @Input() titulo = '';
  @Input() mensaje = '';
}
