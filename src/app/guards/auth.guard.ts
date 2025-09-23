import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SupabaseService } from '../services/supabase.service';

export const authGuard: CanActivateFn = async () => {
  const supabaseService = inject(SupabaseService);
  const router = inject(Router);

  const { data } = await supabaseService.getCurrentUser();
  const user = data.user;

  if (user) {
    return true; // ✅ --> usuario logueado
  } else {
    router.navigate(['/login']);
    return false;
  }
};
