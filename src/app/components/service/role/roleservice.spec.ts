import { TestBed } from '@angular/core/testing';

import { Roleservice } from './roleservice';

describe('Roleservice', () => {
  let service: Roleservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Roleservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
