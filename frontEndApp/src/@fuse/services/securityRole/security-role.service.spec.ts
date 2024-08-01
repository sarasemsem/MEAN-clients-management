import { TestBed } from '@angular/core/testing';

import { SecurityRoleService } from './security-role.service';

describe('SecurityRoleService', () => {
  let service: SecurityRoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SecurityRoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
