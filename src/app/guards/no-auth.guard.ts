import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

export const noAuthGuard: CanActivateFn = async () => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  const { data } = await supabaseService.getCurrentUser();
  const user = data.user;

  if (user) {
    router.navigate(['/juegos']); 
    return false; 
  } else {
    return true; // ✅ solo si no está logueado puede ver login o registro
  }
};
