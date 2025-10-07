// src/app/components/resultados/resultados.ts
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './resultados.html',
  styleUrls: ['./resultados.scss'],
})
export class ResultadosComponent {
  ahorcado = signal<any[]>([]);
  mayorMenor = signal<any[]>([]);
  preguntados = signal<any[]>([]);
  // --- NUEVO: Resultados de Adivina la Bandera ---
  adivinaBandera = signal<any[]>([]);
  loading = signal<boolean>(true);

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.cargarResultados();
  }

  async cargarResultados() {
    this.loading.set(true);
    try {
      // 🪓 Ahorcado → OK
      const ahorcadoData = await this.supabase.getTableResults('hangman_results', 'time_ms', true);
      console.log('👉 Ahorcado:', ahorcadoData);
      this.ahorcado.set(ahorcadoData);

      // 🔼🔽 Mayor o Menor → usamos correct_count en vez de aciertos
      const mayorMenorData = await this.supabase.getTableResults('higher_lower_results', 'correct_count', true);
      console.log('👉 Mayor o Menor:', mayorMenorData);
      this.mayorMenor.set(mayorMenorData);

      // ❓ Preguntados → usamos correct_answers en vez de aciertos
      const preguntadosData = await this.supabase.getTableResults('quiz_results', 'correct_answers', true);
      console.log('👉 Preguntados:', preguntadosData);
      this.preguntados.set(preguntadosData);

      // 🗺️ Adivina la Bandera → Ordenar por puntuación descendente
      const adivinaBanderaData = await this.supabase.getTableResults('adivina_bandera_scores', 'score', false); // false para descendente
      console.log('👉 Adivina la Bandera:', adivinaBanderaData);
      this.adivinaBandera.set(adivinaBanderaData);


    } catch (error) {
      console.error('❌ Error cargando resultados', error);
    }
    this.loading.set(false);
  }

}