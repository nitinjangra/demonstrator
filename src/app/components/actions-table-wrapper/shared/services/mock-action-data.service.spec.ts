import { TestBed } from '@angular/core/testing';
import { mockTableData } from '../mock/actions-table.mock';
import { MockActionDataService } from './mock-action-data.service';

describe('MockActionDataService', () => {
  let service: MockActionDataService;
  const storageKey = 'mock-action-table-data';

  beforeEach(() => {
    localStorage.removeItem(storageKey);
    TestBed.configureTestingModule({});
    service = TestBed.inject(MockActionDataService);
  });

  afterEach(() => localStorage.removeItem(storageKey));

  it('returns default data when storage is empty', () => {
    expect(service.getRows()).toBe(mockTableData);
  });

  it('reads saved arrays and falls back for malformed or non-array values', () => {
    const savedRows = [{ ...mockTableData[0], id: 999 }];
    service.saveRows(savedRows);
    expect(service.getRows()).toEqual(JSON.parse(JSON.stringify(savedRows)));

    localStorage.setItem(storageKey, JSON.stringify({ rows: [] }));
    expect(service.getRows()).toBe(mockTableData);

    localStorage.setItem(storageKey, '{ malformed');
    expect(service.getRows()).toBe(mockTableData);
  });

  it('resets saved data', () => {
    service.saveRows([]);
    service.reset();
    expect(service.getRows()).toBe(mockTableData);
  });
});
