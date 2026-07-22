import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
 import { ActionTableRow } from '../../../../shared/interfaces/actions-table.interface';
import { mockTableData } from '../mock/actions-table.mock';

@Injectable({
  providedIn: 'root',
})
export class AgTableApiService {
  fetchTableData(): Observable<ActionTableRow[]> {
    return of(mockTableData);
  }
}
