import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ActionTableRow } from '../../../../shared/interfaces/actions-table.interface';
import { MockActionDataService } from './mock-action-data.service';

@Injectable({
  providedIn: 'root',
})
export class AgTableApiService {
  private readonly mockActionData = inject(MockActionDataService);

  fetchTableData(): Observable<ActionTableRow[]> {
    return of(this.mockActionData.getRows());
  }
}
