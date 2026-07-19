import { TestBed } from '@angular/core/testing';

import { AgTableActionService } from './ag-table-action.service';

describe('AgTableActionService', () => {
  let service: AgTableActionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgTableActionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
