import { Injectable } from '@angular/core';
import type { ActionTableRow } from '../../../../shared/interfaces/actions-table.interface';
import { mockTableData } from '../mock/actions-table.mock';

const STORAGE_KEY = 'mock-action-table-data';

@Injectable({ providedIn: 'root' })
export class MockActionDataService {
  getRows(): ActionTableRow[] {
    if (typeof localStorage === 'undefined') return mockTableData;

    try {
      const savedRows = localStorage.getItem(STORAGE_KEY);
      if (savedRows === null) return mockTableData;

      const parsedRows: unknown = JSON.parse(savedRows);
      return Array.isArray(parsedRows) ? (parsedRows as ActionTableRow[]) : mockTableData;
    } catch {
      return mockTableData;
    }
  }

  saveRows(rows: ActionTableRow[]): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
    }
  }

  reset(): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
}
