import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Personaldashboard } from './personaldashboard';

describe('Personaldashboard', () => {
  let component: Personaldashboard;
  let fixture: ComponentFixture<Personaldashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Personaldashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Personaldashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
