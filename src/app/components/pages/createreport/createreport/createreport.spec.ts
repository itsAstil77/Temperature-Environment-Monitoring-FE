import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Createreport } from './createreport';

describe('Createreport', () => {
  let component: Createreport;
  let fixture: ComponentFixture<Createreport>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Createreport]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Createreport);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
