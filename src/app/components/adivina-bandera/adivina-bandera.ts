import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GamesService } from '../../services/games.service';
import { AuthService } from '../../services/auth.service';

interface Bandera {
  pais: string;
  urlBandera: string;
}

@Component({
  selector: 'app-adivina-bandera',
  standalone: true,
  imports: [CommonModule, FormsModule, NgIf, NgClass],
  templateUrl: './adivina-bandera.html',
  styleUrls: ['./adivina-bandera.scss']
})
export class AdivinaBanderaComponent implements OnInit {
  private banderas: Bandera[] = [
    { pais: 'argentina', urlBandera: 'https://flagcdn.com/w320/ar.png' },
    { pais: 'brasil', urlBandera: 'https://flagcdn.com/w320/br.png' },
    { pais: 'chile', urlBandera: 'https://flagcdn.com/w320/cl.png' },
    { pais: 'mexico', urlBandera: 'https://flagcdn.com/w320/mx.png' },
    { pais: 'españa', urlBandera: 'https://flagcdn.com/w320/es.png' },
    { pais: 'estados unidos', urlBandera: 'https://flagcdn.com/w320/us.png' },
    { pais: 'francia', urlBandera: 'https://flagcdn.com/w320/fr.png' },
    { pais: 'alemania', urlBandera: 'https://flagcdn.com/w320/de.png' },
    { pais: 'japon', urlBandera: 'https://flagcdn.com/w320/jp.png' },
    { pais: 'canada', urlBandera: 'https://flagcdn.com/w320/ca.png' },
    { pais: 'reino unido', urlBandera: 'https://flagcdn.com/w320/gb.png' },
    { pais: 'italia', urlBandera: 'https://flagcdn.com/w320/it.png' },
    { pais: 'china', urlBandera: 'https://flagcdn.com/w320/cn.png' },
    { pais: 'india', urlBandera: 'https://flagcdn.com/w320/in.png' },
    { pais: 'australia', urlBandera: 'https://flagcdn.com/w320/au.png' },
  ];

  banderaActual = signal<Bandera | null>(null);
  entradaAdivinanza: string = '';
  mensaje = signal<{ texto: string; clase: string } | null>(null);
  puntuacion = signal(0);
  aciertosCorrectos = signal(0);
  intentosTotales = signal(0);
  intentosBanderaActual = signal(0);
  tiempoInicio: number = 0;
  tiempoTranscurrido = signal(0);
  juegoTerminado = signal(false);

  totalBanderasAdivinar: number = 5;
  banderasJugadasContador: number = 0;
  private indicesBanderasUsadas: Set<number> = new Set();

  limiteIntentosPorBandera: number = 5;

  constructor(private gamesService: GamesService, private authService: AuthService) {}

  ngOnInit() {
    this.iniciarJuego();
  }

  iniciarJuego() {
    this.puntuacion.set(0);
    this.aciertosCorrectos.set(0);
    this.intentosTotales.set(0);
    this.tiempoTranscurrido.set(0);
    this.juegoTerminado.set(false);
    this.banderasJugadasContador = 0;
    this.indicesBanderasUsadas.clear();
    this.tiempoInicio = Date.now();
    this.siguienteBandera();
  }

  siguienteBandera() {
    if (this.banderasJugadasContador >= this.totalBanderasAdivinar) {
      this.finalizarJuego();
      return;
    }

    this.entradaAdivinanza = '';
    this.mensaje.set(null); // Limpiar mensaje al pasar a la siguiente bandera
    this.intentosBanderaActual.set(0);

    let indiceAleatorio: number;
    do {
      indiceAleatorio = Math.floor(Math.random() * this.banderas.length);
    } while (this.indicesBanderasUsadas.has(indiceAleatorio));

    this.indicesBanderasUsadas.add(indiceAleatorio);
    this.banderaActual.set(this.banderas[indiceAleatorio]);
  }

  verificarAdivinanza() {
    if (!this.entradaAdivinanza || this.juegoTerminado()) return;

    this.intentosTotales.update(val => val + 1);
    this.intentosBanderaActual.update(val => val + 1);

    const adivinanzaLimpia = this.limpiarCadena(this.entradaAdivinanza);
    const paisLimpio = this.limpiarCadena(this.banderaActual()!.pais);

    if (adivinanzaLimpia === paisLimpio) {
      this.mensaje.set({ texto: '¡Correcto! 🎉', clase: 'alert-success' });
      this.aciertosCorrectos.update(val => val + 1);
      this.banderasJugadasContador++;

      let puntos = 100 - (this.intentosBanderaActual() - 1) * 20;
      if (puntos < 20) puntos = 20;
      this.puntuacion.update(s => s + puntos);

      setTimeout(() => this.siguienteBandera(), 1500);
    } else {
      if (this.intentosBanderaActual() >= this.limiteIntentosPorBandera) {
        this.puntuacion.update(s => Math.max(0, s - 20));
        this.mensaje.set({
          texto: `¡Demasiados intentos! La respuesta era: ${this.banderaActual()!.pais.toUpperCase()}. ⏭️`,
          clase: 'alert-skipped' // Nueva clase para este tipo de mensaje
        });
        this.banderasJugadasContador++;
        setTimeout(() => this.siguienteBandera(), 2000);
      } else {
        this.mensaje.set({
          texto: `Incorrecto. Intenta de nuevo. Llevas ${this.intentosBanderaActual()} de ${this.limiteIntentosPorBandera} intentos.`,
          clase: 'alert-danger'
        });
      }
    }
  }

  saltarBandera() {
    if (this.juegoTerminado()) return;

    this.puntuacion.update(s => Math.max(0, s - 20));
    this.mensaje.set({
      texto: `Bandera saltada. La respuesta era: ${this.banderaActual()!.pais.toUpperCase()}. ⏭️`,
      clase: 'alert-skipped' 
    });
    this.banderasJugadasContador++;

    setTimeout(() => this.siguienteBandera(), 2000);
  }

  limpiarCadena(cadena: string): string {
    return cadena
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, '')
      .trim();
  }

  async finalizarJuego() {
    this.juegoTerminado.set(true);
    this.tiempoTranscurrido.set(Date.now() - this.tiempoInicio);

    const usuario = this.authService.getCurrentUser();

    try {
      await this.gamesService.saveFlagGuesserResult({
        user_id: usuario?.id ?? null,
        username: (usuario as any)?.email ?? null,
        score: this.puntuacion(),
        time_taken_ms: this.tiempoTranscurrido(),
        flags_guessed: this.aciertosCorrectos(),
        total_attempts: this.intentosTotales()
      });
      console.log('Resultado de Adivina la Bandera guardado con éxito.');
    } catch (e) {
      console.error('Error al guardar resultado de Adivina la Bandera', e);
    }
  }

  reiniciarJuego() {
    this.iniciarJuego();
  }
}