import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimations } from '@angular/platform-browser/animations'; // 👈 1. IMPORTÁ ESTO
import { provideHttpClient } from '@angular/common/http'; // 👈 1. IMPORTÁ ESTO


import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideAnimations(),
    provideHttpClient() // 👈 2. AÑADÍ ESTO
  ]
};