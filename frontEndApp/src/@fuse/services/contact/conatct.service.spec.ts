import { TestBed } from '@angular/core/testing';

import { ConatctService } from './conatct.service';

describe('ConatctService', () => {
  let service: ConatctService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConatctService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
