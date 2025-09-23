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
  // Lista de palabras posibles
  private palabras = ['angular', 'supabase', 'memoria', 'juego', 'prueba', 'componente'];

  // Estado del juego
  palabra = this.palabras[Math.floor(Math.random() * this.palabras.length)];
  reveladas = signal(new Array(this.palabra.length).fill(false)); // letras reveladas
  letrasIntentadas = signal(new Set<string>()); // letras que ya probó
  errores = signal(0); // cantidad de errores
  maxErrores = 6; // límite de errores
  tiempoInicio = Date.now();
  terminado = signal(false);
  gano = signal(false);

  // Alfabeto (incluye la ñ)
  alfabeto = 'abcdefghijklmnñopqrstuvwxyz'.split('');

  constructor(private juegos: GamesService, private auth: AuthService) {}

  // Saber si un botón de letra debe estar deshabilitado
  letraDeshabilitada(letra: string) {
    return this.letrasIntentadas().has(letra) || this.terminado();
  }

  // Cuando el usuario elige una letra
  elegir(letra: string) {
    if (this.terminado()) return;

    this.letrasIntentadas().add(letra);

    const indices: number[] = [];
    for (let i = 0; i < this.palabra.length; i++) {
      if (this.palabra[i] === letra) indices.push(i);
    }

    if (indices.length === 0) {
      // Falló la letra
      this.errores.update(e => e + 1);
      if (this.errores() >= this.maxErrores) {
        this.finalizar(false);
      }
    } else {
      // Acertó la letra → revelar posiciones
      const arr = [...this.reveladas()];
      indices.forEach(i => arr[i] = true);
      this.reveladas.set(arr);

      // Si reveló todas, gana
      if (arr.every(Boolean)) this.finalizar(true);
    }
  }

  // Finalizar la partida
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
