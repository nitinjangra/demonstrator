import { TestBed } from '@angular/core/testing';

import { AgTableApiService } from './ag-table-api.service';

describe('AgGridApi', () => {
  let service: AgTableApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgTableApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
