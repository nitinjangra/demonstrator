import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ActionTableRow } from '../../../../shared/interfaces/actions-table.interface';
import { AgTableApiService } from './ag-table-api.service';
import { mockTableData } from '../mock/actions-table.mock';
import { AgTableStateService } from './ag-table-state.service';

import { AgTableActionService } from './ag-table-action.service';

describe('AgTableActionService', () => {
  let service: AgTableActionService;
  let apiService: jasmine.SpyObj<AgTableApiService>;
  let stateService: AgTableStateService;

  beforeEach(() => {
    apiService = jasmine.createSpyObj<AgTableApiService>('AgTableApiService', ['fetchTableData']);
    apiService.fetchTableData.and.returnValue(of([]));

    TestBed.configureTestingModule({
      providers: [
        AgTableActionService,
        AgTableStateService,
        { provide: AgTableApiService, useValue: apiService },
      ],
    });
    service = TestBed.inject(AgTableActionService);
    stateService = TestBed.inject(AgTableStateService);
  });

  it('should load API rows into shared table state', () => {
    const rows = mockTableData.slice(0, 2);
    const emissions: ActionTableRow[][] = [];
    stateService.getRowData().subscribe((value) => emissions.push(value));
    apiService.fetchTableData.and.returnValue(of(rows));

    service.loadGridData();

    expect(apiService.fetchTableData).toHaveBeenCalledOnceWith();
    expect(emissions).toEqual([[], rows]);
  });
});
