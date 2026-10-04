import { inject, Injectable } from '@angular/core';
import { tap } from 'rxjs';
import { AgTableApiService } from './ag-table-api.service';
import { AgTableStateService } from './ag-table-state.service';

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
}
