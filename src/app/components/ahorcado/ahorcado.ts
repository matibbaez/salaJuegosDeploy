import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GamesService } from '../../services/games.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ahorcado.html',
  styleUrls: ['./ahorcado.scss']
})
export class AhorcadoComponent {
  private palabras = ['angular', 'supabase', 'memoria', 'juego', 'prueba', 'componente'];

  // estado del juego
  palabra = this.palabras[Math.floor(Math.random() * this.palabras.length)];
  reveladas = signal(new Array(this.palabra.length).fill(false)); 
  letrasIntentadas = signal(new Set<string>()); 
  errores = signal(0); 
  maxErrores = 6; 
  tiempoInicio = Date.now();
  terminado = signal(false);
  gano = signal(false);

  alfabeto = 'abcdefghijklmnñopqrstuvwxyz'.split('');

  constructor(private juegos: GamesService, private auth: AuthService) {}

  letraDeshabilitada(letra: string) {
    return this.letrasIntentadas().has(letra) || this.terminado();
  }

  elegir(letra: string) {
    if (this.terminado()) return;

    this.letrasIntentadas().add(letra);

    const indices: number[] = [];
    for (let i = 0; i < this.palabra.length; i++) {
      if (this.palabra[i] === letra) indices.push(i);
    }

    if (indices.length === 0) {
      // falló la letra
      this.errores.update(e => e + 1);
      if (this.errores() >= this.maxErrores) {
        this.finalizar(false);
      }
    } else {
      // acertó la letra → revelar posiciones
      const arr = [...this.reveladas()];
      indices.forEach(i => arr[i] = true);
      this.reveladas.set(arr);

      // si reveló todas, gana
      if (arr.every(Boolean)) this.finalizar(true);
    }
  }

  async finalizar(ganoPartida: boolean) {
    this.terminado.set(true);
    this.gano.set(ganoPartida);

    const tiempo_ms = Date.now() - this.tiempoInicio;
    const usuario = this.auth.getCurrentUser();

    try {
      await this.juegos.saveHangmanResult({
        user_id: usuario?.id ?? null,
        username: (usuario as any)?.email ?? null,
        word: this.palabra,
        won: ganoPartida,
        time_ms: tiempo_ms,
        guesses: this.letrasIntentadas().size,
        wrong_guesses: this.errores()
      });
    } catch (e) {
      console.error('Error al guardar resultado del ahorcado', e);
    }
  }

  // Reiniciar la partida
  reiniciar() {
    this.palabra = this.palabras[Math.floor(Math.random() * this.palabras.length)];
    this.reveladas.set(new Array(this.palabra.length).fill(false));
    this.letrasIntentadas.set(new Set<string>());
    this.errores.set(0);
    this.tiempoInicio = Date.now();
    this.terminado.set(false);
    this.gano.set(false);
  }
}
