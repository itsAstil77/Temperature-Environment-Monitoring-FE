import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Processautomation } from './processautomation';

describe('Processautomation', () => {
  let component: Processautomation;
  let fixture: ComponentFixture<Processautomation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Processautomation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Processautomation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
