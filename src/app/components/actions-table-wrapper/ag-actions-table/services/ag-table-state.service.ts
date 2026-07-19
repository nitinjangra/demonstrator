import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import type { ColDef } from 'ag-grid-community';
import { ActionTableRow } from '../../../../shared/interfaces/actions-table.interface';

@Injectable({
  providedIn: 'root',
})
export class AgTableStateService {
  private readonly rowData$ = new BehaviorSubject<ActionTableRow[]>([]);
  private readonly colDefs$ = new BehaviorSubject<ColDef<ActionTableRow>[]>([]);

  getRowData(): Observable<ActionTableRow[]> {
    return this.rowData$.asObservable();
  }

  setRowData(rowData: ActionTableRow[]): void {
    this.rowData$.next(rowData);
  }

  getColDefs(): Observable<ColDef<ActionTableRow>[]> {
    return this.colDefs$.asObservable();
  }

  setColDefs(colDefs: ColDef<ActionTableRow>[]): void {
    this.colDefs$.next(colDefs);
  }
}
