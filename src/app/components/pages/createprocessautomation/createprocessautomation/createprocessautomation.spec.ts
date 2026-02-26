import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Createprocessautomation } from './createprocessautomation';

describe('Createprocessautomation', () => {
  let component: Createprocessautomation;
  let fixture: ComponentFixture<Createprocessautomation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Createprocessautomation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Createprocessautomation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
