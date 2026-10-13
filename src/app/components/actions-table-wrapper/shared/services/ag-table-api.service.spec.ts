import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { AgTableApiService } from './ag-table-api.service';
import { mockTableData } from '../mock/actions-table.mock';

describe('AgGridApi', () => {
  let service: AgTableApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgTableApiService);
  });

  it('should return the action table data', async () => {
    await expectAsync(firstValueFrom(service.fetchTableData())).toBeResolvedTo(mockTableData);
  });
});
