import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { Franquicia, Nivel, Pregunta } from '../models/trivia.models';

// ============================================================
// SERVICIO REST (solo lee datos del backend)
// Un servicio es una clase que se encarga de UNA tarea y que los
// componentes reciben por inyección de dependencias (inject).
// Este habla con json-server (db.json) usando el método GET.
//
//   GET http://localhost:3000/franquicias
//   GET http://localhost:3000/preguntas?franquicia=the-walking-dead&nivel=facil
//
// Devuelve Observables: el componente se "suscribe" y recibe la
// respuesta cuando llega (o un error si el servidor no responde).
// ============================================================
@Injectable({ providedIn: 'root' })
export class PreguntasService {
  private readonly http = inject(HttpClient);
  private readonly api = 'http://localhost:3000';

  obtenerFranquicias(): Observable<Franquicia[]> {
    return this.http.get<Franquicia[]>(`${this.api}/franquicias`);
  }

  obtenerPreguntas(franquicia: string, nivel: Nivel): Observable<Pregunta[]> {
    // HttpParams arma el "?franquicia=...&nivel=..." de la URL sin concatenar texto a mano.
    const params = new HttpParams().set('franquicia', franquicia).set('nivel', nivel);
    return this.http.get<Pregunta[]>(`${this.api}/preguntas`, { params });
  }
}
