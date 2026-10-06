import { NgClass, NgFor, NgIf } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { ErrorCargaComponent } from '../../components/error-carga/error-carga.component';
import { Franquicia, NIVELES, Nivel } from '../../models/trivia.models';
import { NivelNombrePipe } from '../../pipes/nivel-nombre.pipe';
import { PreguntasService } from '../../services/preguntas.service';

// ============================================================
// PÁGINA DE INICIO: formulario para elegir franquicia y dificultad.
// Usa un formulario reactivo (ReactiveFormsModule):
//   - formulario.franquicia → el <select>
//   - formulario.nivel      → los tres botones de dificultad
// El botón "Comenzar" queda deshabilitado hasta que ambos campos tengan valor.
// ============================================================
@Component({
  selector: 'app-inicio',
  imports: [ReactiveFormsModule, NgFor, NgIf, NgClass, ErrorCargaComponent, NivelNombrePipe],
  templateUrl: './inicio.component.html'
})
export class InicioComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly preguntasService = inject(PreguntasService);

  readonly niveles = NIVELES;
  franquicias: Franquicia[] = [];
  errorConexion = false;

  readonly formulario = this.fb.nonNullable.group({
    franquicia: ['', Validators.required],
    nivel: ['' as Nivel | '', Validators.required]
  });

  // ngOnInit se ejecuta una vez, cuando el componente ya está listo.
  // Aquí pedimos el catálogo de franquicias al backend (GET /franquicias).
  ngOnInit(): void {
    this.preguntasService.obtenerFranquicias().subscribe({
      next: (lista) => {
        this.franquicias = lista;
        if (lista.length > 0) {
          this.formulario.controls.franquicia.setValue(lista[0].slug);
        }
      },
      error: () => {
        this.errorConexion = true;
      }
    });
  }

  elegirNivel(nivel: Nivel): void {
    this.formulario.controls.nivel.setValue(nivel);
  }

  comenzar(): void {
    const { franquicia, nivel } = this.formulario.getRawValue();
    if (this.formulario.invalid || nivel === '') {
      return;
    }
    // Navega a /jugar/the-walking-dead/facil (por ejemplo)
    this.router.navigate(['/jugar', franquicia, nivel]);
  }
}
