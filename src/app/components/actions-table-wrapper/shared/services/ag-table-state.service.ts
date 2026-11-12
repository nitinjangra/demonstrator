import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { ActionTableRow } from '../../../../shared/interfaces/actions-table.interface';

@Injectable({
  providedIn: 'root',
})
export class AgTableStateService {
  private readonly rowData$ = new BehaviorSubject<ActionTableRow[]>([]);
  readonly rowData = signal<ActionTableRow[]>([]);
  readonly loadStatus = signal<'loading' | 'loaded' | 'refreshing' | 'error'>('loading');

  getRowData(): Observable<ActionTableRow[]> {
    return this.rowData$.asObservable();
  }

  setRowData(rowData: ActionTableRow[]): void {
    this.rowData.set(rowData);
    this.rowData$.next(rowData);
  }
}
