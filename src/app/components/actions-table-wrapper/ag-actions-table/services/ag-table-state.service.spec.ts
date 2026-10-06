import { TestBed } from '@angular/core/testing';
import { take } from 'rxjs';
import { ActionTableRow } from '../../../../shared/interfaces/actions-table.interface';

import { AgTableStateService } from './ag-table-state.service';

describe('AgTableStateService', () => {
  let service: AgTableStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AgTableStateService);
  });

  it('should emit the initial rows and later row updates', () => {
    const rows: ActionTableRow[] = [
      { id: 1, entityName: 'Example', entityId: 'entity-1', dueDate: null },
    ];
    const emissions: ActionTableRow[][] = [];

    service.getRowData().pipe(take(2)).subscribe((value) => emissions.push(value));
    service.setRowData(rows);

    expect(emissions).toEqual([[], rows]);
  });
});
