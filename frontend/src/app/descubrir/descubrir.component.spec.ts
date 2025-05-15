import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DescubrirComponent } from './descubrir.component';

describe('DescubrirComponent', () => {
  let component: DescubrirComponent;
  let fixture: ComponentFixture<DescubrirComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DescubrirComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DescubrirComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
