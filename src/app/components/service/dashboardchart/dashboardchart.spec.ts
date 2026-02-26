import { TestBed } from '@angular/core/testing';

import { Dashboardchart } from './dashboardchart';

describe('Dashboardchart', () => {
  let service: Dashboardchart;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Dashboardchart);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
