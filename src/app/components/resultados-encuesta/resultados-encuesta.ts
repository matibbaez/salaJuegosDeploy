// src/app/componentes/resultados-encuesta/resultados-encuesta.component.ts
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-resultados-encuesta',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './resultados-encuesta.html',
  styleUrls: ['./resultados-encuesta.scss']
})
export class ResultadosEncuestaComponent implements OnInit {
  resultadosEncuesta = signal<any[]>([]);
  cargando = signal(true);

  constructor(private servicioSupabase: SupabaseService) {}

  ngOnInit(): void {
    this.cargarResultados();
  }

  async cargarResultados() {
    this.cargando.set(true);
    try {
      const resultados = await this.servicioSupabase.obtenerResultadosEncuestas();
      this.resultadosEncuesta.set(resultados);
    } catch (error) {
      console.error("Error al cargar los resultados de la encuesta:", error);
    } finally {
      this.cargando.set(false);
    }
  }
}