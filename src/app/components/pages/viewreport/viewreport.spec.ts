import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Viewreport } from './viewreport';

describe('Viewreport', () => {
  let component: Viewreport;
  let fixture: ComponentFixture<Viewreport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Viewreport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Viewreport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
