// src/app/componentes/encuesta/encuesta.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './encuesta.html',
  styleUrls: ['./encuesta.scss']
})
export class EncuestaComponent implements OnInit {
  formularioEncuesta!: FormGroup;
  enviando = false;
  mensajeExito = '';
  mensajeError = '';

  constructor(
    private fb: FormBuilder,
    private servicioSupabase: SupabaseService,
    private servicioAuth: AuthService,
    private enrutador: Router
  ) {}

  ngOnInit(): void {
    this.formularioEncuesta = this.fb.group({
      nombreCompleto: ['', Validators.required],
      edad: ['', [Validators.required, Validators.min(18), Validators.max(99)]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{1,10}$')]],
      satisfaccion: [null, Validators.required],
      juegoFavorito: ['ahorcado', Validators.required],
      comentarios: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  // Getter para un acceso más fácil a los controles en la plantilla
  get form() { return this.formularioEncuesta.controls; }

  async enviarFormulario() {
    if (this.formularioEncuesta.invalid) {
      this.formularioEncuesta.markAllAsTouched();
      return;
    }

    this.enviando = true;
    this.mensajeError = '';
    this.mensajeExito = '';

    try {
      const usuario = this.servicioAuth.getCurrentUser();
      if (!usuario) throw new Error('Debes iniciar sesión para enviar la encuesta.');

      const valores = this.formularioEncuesta.value;
      const datosEncuesta = {
        id_usuario: usuario.id,
        email_usuario: usuario.email,
        nombre_completo: valores.nombreCompleto,
        edad: valores.edad,
        telefono: valores.telefono,
        satisfaccion: valores.satisfaccion,
        juego_favorito: valores.juegoFavorito,
        comentarios: valores.comentarios,
      };

      await this.servicioSupabase.guardarResultadoEncuesta(datosEncuesta);

      this.mensajeExito = '¡Encuesta enviada con éxito! Gracias por tu opinión.';
      this.formularioEncuesta.reset();
      
      setTimeout(() => this.enrutador.navigate(['/juegos']), 2000);

    } catch (error: any) {
      this.mensajeError = error.message || 'Ocurrió un error al enviar la encuesta.';
    } finally {
      this.enviando = false;
    }
  }
}