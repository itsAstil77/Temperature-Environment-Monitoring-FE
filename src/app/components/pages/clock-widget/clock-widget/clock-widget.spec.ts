import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClockWidget } from './clock-widget';

describe('ClockWidget', () => {
  let component: ClockWidget;
  let fixture: ComponentFixture<ClockWidget>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ClockWidget]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ClockWidget);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
