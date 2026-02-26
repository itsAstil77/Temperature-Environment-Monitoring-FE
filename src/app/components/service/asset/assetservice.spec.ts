import { TestBed } from '@angular/core/testing';

import { Assetservice } from './assetservice';

describe('Assetservice', () => {
  let service: Assetservice;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Assetservice);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
