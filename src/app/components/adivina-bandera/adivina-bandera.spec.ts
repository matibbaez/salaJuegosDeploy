import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdivinaBandera } from './adivina-bandera';

describe('AdivinaBandera', () => {
  let component: AdivinaBandera;
  let fixture: ComponentFixture<AdivinaBandera>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdivinaBandera]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdivinaBandera);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
