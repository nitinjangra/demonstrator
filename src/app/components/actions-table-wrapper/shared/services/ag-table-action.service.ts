import { inject, Injectable } from '@angular/core';
import { catchError, EMPTY, take, tap } from 'rxjs';
import { AgTableApiService } from './ag-table-api.service';
import { AgTableStateService } from './ag-table-state.service';

@Injectable({
  providedIn: 'root',
})
export class AgTableActionService {
  private readonly apiService = inject(AgTableApiService);
  private readonly state = inject(AgTableStateService);

  loadGridData(): void {
    const wasLoaded =
      this.state.loadStatus() === 'loaded' ||
      (this.state.loadStatus() === 'error' && this.state.rowData().length > 0);
    this.state.loadStatus.set(wasLoaded ? 'refreshing' : 'loading');
    this.apiService
      .fetchTableData()
      .pipe(
        take(1),
        tap((rowData) => {
          this.state.setRowData(rowData);
          this.state.loadStatus.set('loaded');
        }),
        catchError(() => {
          this.state.loadStatus.set('error');
          return EMPTY;
        }),
      )
      .subscribe();
  }
}
