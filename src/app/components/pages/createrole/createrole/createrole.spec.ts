import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Createrole } from './createrole';

describe('Createrole', () => {
  let component: Createrole;
  let fixture: ComponentFixture<Createrole>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Createrole]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Createrole);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
