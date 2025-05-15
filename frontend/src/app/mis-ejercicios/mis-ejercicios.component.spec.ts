import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisEjerciciosComponent } from './mis-ejercicios.component';

describe('MisEjerciciosComponent', () => {
  let component: MisEjerciciosComponent;
  let fixture: ComponentFixture<MisEjerciciosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MisEjerciciosComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisEjerciciosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
