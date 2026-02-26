import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Historicals } from './historicals';

describe('Historicals', () => {
  let component: Historicals;
  let fixture: ComponentFixture<Historicals>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Historicals]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Historicals);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
