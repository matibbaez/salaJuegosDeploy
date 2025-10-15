import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app';
import 'bootstrap'; // 👈 AÑADÍ ESTA LÍNEA

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

