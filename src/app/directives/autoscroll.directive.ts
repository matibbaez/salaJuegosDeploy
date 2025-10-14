import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

@Directive({
  selector: '[appAutoscroll]',
  standalone: true
})
export class AutoscrollDirective implements OnChanges {
  @Input('appAutoscroll') trigger: any; 

  constructor(private el: ElementRef) {}

  ngOnChanges() {
    // Usamos setTimeout para asegurar que el DOM se haya actualizado completamente
    // y que el último elemento esté presente antes de intentar hacer scroll.
    setTimeout(() => {
      this.scrollToBottomSmooth();
    }, 0); 
  }

  private scrollToBottomSmooth(): void {
    try {
      const parentElement = this.el.nativeElement;
      if (parentElement) {
        
        const lastChild = parentElement.lastElementChild;

        if (lastChild) {
          // Usamos scrollIntoView con 'smooth' para una animación nativa.
          // 'end' alinea la parte inferior del elemento con la parte inferior del contenedor.
          lastChild.scrollIntoView({ behavior: 'smooth', block: 'end' });
          // console.log('Scroll animado realizado a:', lastChild); // Opcional para depuración
        } else {
          // Si no hay hijos (chat vacío), al menos intentamos un scroll al final del propio contenedor
          parentElement.scrollTop = parentElement.scrollHeight;
        }
      }
    } catch (err) {
      console.error('Error al hacer scroll animado:', err);
    }
  }
}