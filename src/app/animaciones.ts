import { trigger, transition, style, query, animate } from '@angular/animations';

export const animacionRutaDesvanecido =
  // 1. El "Disparador": Le ponemos un nombre a nuestra animación.
  trigger('animacionesRuta', [

    // 2. La "Transición": Esta regla se activa cada vez que cambiamos de una página a otra.
    transition('* <=> *', [
      
      // 3. La "Preparación": Antes de empezar, definimos el estado inicial de ambas páginas.
      query(':enter, :leave', [
        style({
          position: 'absolute', // Ponemos una encima de la otra
          left: 0,
          width: '100%',
          opacity: 0, // Ambas empiezan invisibles
          transform: 'scale(0.98)', // Un poquito más chicas para un efecto sutil
        })
      ], { optional: true }),

      // 4. La "Coreografía": Animamos la página que está ENTRANDO.
      query(':enter', [
        animate('350ms ease-out', style({ 
          opacity: 1, // Se vuelve visible
          transform: 'scale(1)' // Vuelve a su tamaño normal
        }))
      ], { optional: true })
      
    ]),
  ]);