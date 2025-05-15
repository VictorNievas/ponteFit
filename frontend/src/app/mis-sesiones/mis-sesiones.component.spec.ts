import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MisSesionesComponent } from './mis-sesiones.component';

describe('MisSesionesComponent', () => {
  let component: MisSesionesComponent;
  let fixture: ComponentFixture<MisSesionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MisSesionesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MisSesionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
