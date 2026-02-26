import { TestBed } from '@angular/core/testing';

import { Peopleservice } from './peopleservice';

describe('Peopleservice', () => {
  let service: Peopleservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Peopleservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
