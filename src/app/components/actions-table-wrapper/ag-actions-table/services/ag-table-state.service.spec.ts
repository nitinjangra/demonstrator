import { TestBed } from '@angular/core/testing';

import { AgTableStateService } from './ag-table-state.service';

describe('AgTableStateService', () => {
  let service: AgTableStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgTableStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
