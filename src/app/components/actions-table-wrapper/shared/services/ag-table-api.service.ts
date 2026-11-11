import { inject, Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ActionTableRow } from '../../../../shared/interfaces/actions-table.interface';
import { UserSettingsService } from '../../../../shared/services/user-settings.service';
import { MockActionDataService } from './mock-action-data.service';

@Injectable({
  providedIn: 'root',
})
export class AgTableApiService {
  private readonly mockActionData = inject(MockActionDataService);
  private readonly userSettings = inject(UserSettingsService);

  fetchTableData(): Observable<ActionTableRow[]> {
    const rows = this.mockActionData.getRows();
    const visibleRows = this.userSettings.profileId() === 'standard' ? rows.slice(0, 4) : rows;
    return of(visibleRows);
  }
}
