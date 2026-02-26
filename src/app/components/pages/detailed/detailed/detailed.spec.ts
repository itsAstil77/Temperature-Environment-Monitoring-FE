import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Detailed } from './detailed';

describe('Detailed', () => {
  let component: Detailed;
  let fixture: ComponentFixture<Detailed>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Detailed]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Detailed);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
