import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SupabaseService } from '../services/supabase.service';

export const adminGuard: CanActivateFn = async () => {
  const servicioAuth = inject(AuthService);
  const servicioSupabase = inject(SupabaseService);
  const enrutador = inject(Router);

  const usuario = servicioAuth.getCurrentUser();

  if (!usuario) {
    enrutador.navigate(['/login']);
    return false;
  }

  try {
    const perfil = await servicioSupabase.obtenerPerfilUsuario(usuario.id);
    if (perfil && perfil.es_admin) {
      return true; // ✅ Es admin, puede pasar
    } else {
      enrutador.navigate(['/juegos']); // No es admin, lo mandamos a los juegos
      return false;
    }
  } catch (error) {
    console.error('Error al verificar el estado de administrador:', error);
    enrutador.navigate(['/juegos']); // En caso de error, no dar acceso
    return false;
  }
};