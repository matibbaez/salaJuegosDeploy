import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SupabaseService } from '../../services/supabase.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-encuesta',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './encuesta.html',
  styleUrls: ['./encuesta.scss']
})
export class EncuestaComponent implements OnInit {
  formularioEncuesta!: FormGroup;
  enviando = false;
  mensajeExito = '';
  mensajeError = '';
  yaEnviado = signal<boolean>(false);
  cargandoEstado = signal<boolean>(true); 

  constructor(
    private fb: FormBuilder,
    private servicioSupabase: SupabaseService,
    private servicioAuth: AuthService,
    private enrutador: Router
  ) {}

  ngOnInit(): void {
    this.verificarEstadoEncuesta(); 

    // El formulario se inicializa aquí 
    this.formularioEncuesta = this.fb.group({
      nombreCompleto: ['', [Validators.required, Validators.pattern(/^(?!\s*$)[a-zA-Z\s'-]+$/)]],
      edad: ['', [Validators.required, Validators.min(18), Validators.max(99)]],
      telefono: ['', [Validators.required, Validators.pattern('^[0-9]{1,10}$')]],
      satisfaccion: [null, Validators.required],
      juegoFavorito: ['ahorcado', Validators.required],
      comentarios: ['', [Validators.required, Validators.minLength(10), Validators.pattern(/^(?!.*(.)\1{4,}).*$/)]]
    });
  }

  async verificarEstadoEncuesta() {
    this.cargandoEstado.set(true); 
    const usuario = this.servicioAuth.getCurrentUser();
    if (usuario) {
      const haEnviado = await this.servicioSupabase.verificarEncuestaUsuario(usuario.id);
      this.yaEnviado.set(haEnviado);
    }
    this.cargandoEstado.set(false); 
  }

  get form() { return this.formularioEncuesta.controls; }

  async enviarFormulario() {
    if (this.formularioEncuesta.invalid) {
      this.formularioEncuesta.markAllAsTouched();
      return;
    }

    this.enviando = true;
    this.mensajeError = '';
    
    try {
      const usuario = this.servicioAuth.getCurrentUser();
      if (!usuario) throw new Error('Debes iniciar sesión.');

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
      this.yaEnviado.set(true);
      
    } catch (error: any) {
      this.mensajeError = error.message || 'Ocurrió un error al enviar la encuesta.';
    } finally {
      this.enviando = false;
    }
  }
}