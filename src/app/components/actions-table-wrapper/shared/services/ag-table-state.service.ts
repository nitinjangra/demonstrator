import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActionTableRow } from '../../../../shared/interfaces/actions-table.interface';

@Injectable({
  providedIn: 'root',
})
export class AgTableStateService {
  private readonly rowData$ = new BehaviorSubject<ActionTableRow[]>([]);

  getRowData(): Observable<ActionTableRow[]> {
    return this.rowData$.asObservable();
  }

  setRowData(rowData: ActionTableRow[]): void {
    this.rowData$.next(rowData);
  }
}
