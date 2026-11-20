import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { AgTableApiService } from './ag-table-api.service';
import { mockTableData } from '../mock/actions-table.mock';
import { MockActionDataService } from './mock-action-data.service';

describe('AgGridApi', () => {
  let service: AgTableApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgTableApiService);
  });

  it('should return the action table data', async () => {
    await expectAsync(firstValueFrom(service.fetchTableData())).toBeResolvedTo(mockTableData);
  });

  it('loads persisted action rows and falls back for invalid storage values', () => {
    const storageService = TestBed.inject(MockActionDataService);
    const storageKey = 'mock-action-table-data';
    localStorage.setItem(storageKey, JSON.stringify([{ ...mockTableData[0], id: 999 }]));
    expect(storageService.getRows()[0].id).toBe(999);

    localStorage.setItem(storageKey, JSON.stringify({ rows: [] }));
    expect(storageService.getRows()).toBe(mockTableData);

    localStorage.setItem(storageKey, '{ malformed');
    expect(storageService.getRows()).toBe(mockTableData);

    storageService.reset();
    expect(storageService.getRows()).toBe(mockTableData);
  });
});
