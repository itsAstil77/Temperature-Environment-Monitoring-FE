import { TestBed } from '@angular/core/testing';

import { Peopletype } from './peopletype';

describe('Peopletype', () => {
  let service: Peopletype;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Peopletype);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
