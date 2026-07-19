import { inject, Injectable } from '@angular/core';
import { tap } from 'rxjs';
import type { ColDef } from 'ag-grid-community';
import { AgTableApiService } from './ag-table-api.service';
import { AgTableStateService } from './ag-table-state.service';
import { ActionTableRow } from '../../../../shared/interfaces/actions-table.interface';

@Injectable({
  providedIn: 'root',
})
export class AgTableActionService {
  private readonly apiService = inject(AgTableApiService);
  private readonly state = inject(AgTableStateService);

  loadGridData(): void {
    this.apiService
      .fetchTableData()
      .pipe(tap((rowData) => this.state.setRowData(rowData)))
      .subscribe();
  }

  setColDefs(colDefs: ColDef<ActionTableRow>[]): void {
    this.state.setColDefs(colDefs);
  }
}
