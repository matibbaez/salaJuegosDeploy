import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-resultados',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resultados.html',
  styleUrls: ['./resultados.scss'],
})
export class ResultadosComponent {
  ahorcado = signal<any[]>([]);
  mayorMenor = signal<any[]>([]);
  preguntados = signal<any[]>([]);
  adivinaBandera = signal<any[]>([]);
  loading = signal<boolean>(true);

  juegoSeleccionado: string = 'preguntados';

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.cargarResultados();
  }

  async cargarResultados() {
    this.loading.set(true);
    try {
      const ahorcadoData = await this.supabase.getTableResults('hangman_results', 'time_ms', true);
      console.log('👉 Ahorcado:', ahorcadoData);
      this.ahorcado.set(ahorcadoData);

      const mayorMenorData = await this.supabase.getTableResults('higher_lower_results', 'correct_count', false); 
      console.log('👉 Mayor o Menor:', mayorMenorData);
      this.mayorMenor.set(mayorMenorData);

      const preguntadosData = await this.supabase.getTableResults('quiz_results', 'correct_answers', false);
      console.log('👉 Preguntados:', preguntadosData);
      this.preguntados.set(preguntadosData);

      const adivinaBanderaData = await this.supabase.getTableResults('adivina_bandera_scores', 'score', false);
      console.log('👉 Adivina la Bandera:', adivinaBanderaData);
      this.adivinaBandera.set(adivinaBanderaData);
    } catch (error) {
      console.error('❌ Error cargando resultados', error);
    }
    this.loading.set(false);
  }

  mostrarJuego(nombreJuego: string): boolean {
    return this.juegoSeleccionado === 'todos' || this.juegoSeleccionado === nombreJuego;
  }

  filtrarResultados() {
    console.log('Juego seleccionado:', this.juegoSeleccionado);
  }
}