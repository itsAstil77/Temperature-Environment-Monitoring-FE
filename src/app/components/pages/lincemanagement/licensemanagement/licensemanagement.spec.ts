import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Licensemanagement } from './licensemanagement';

describe('Licensemanagement', () => {
  let component: Licensemanagement;
  let fixture: ComponentFixture<Licensemanagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Licensemanagement]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Licensemanagement);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
