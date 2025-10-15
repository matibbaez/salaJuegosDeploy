import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

@Directive({
  selector: '[appAutoscroll]',
  standalone: true
})
export class AutoscrollDirective implements OnChanges {
  @Input('appAutoscroll') trigger: any; 

  constructor(private el: ElementRef) {}

  ngOnChanges() {
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
          lastChild.scrollIntoView({ behavior: 'smooth', block: 'end' });
        } else {
          parentElement.scrollTop = parentElement.scrollHeight;
        }
      }
    } catch (err) {
      console.error('Error al hacer scroll animado:', err);
    }
  }
}