import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Projecthierarchy } from './projecthierarchy';

describe('Projecthierarchy', () => {
  let component: Projecthierarchy;
  let fixture: ComponentFixture<Projecthierarchy>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Projecthierarchy]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Projecthierarchy);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
