import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MiDietaComponent } from './mi-dieta.component';

describe('MiDietaComponent', () => {
  let component: MiDietaComponent;
  let fixture: ComponentFixture<MiDietaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MiDietaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MiDietaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
