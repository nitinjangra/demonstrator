import { Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import { Priority } from '../../../shared/enums/priority.enum';
import { ActionTableRow } from '../../../shared/interfaces/actions-table.interface';
import { DateTimeSettingsService } from '../../../shared/services/date-time-settings.service';
import { AgTableActionService } from '../shared/services/ag-table-action.service';
import { AgTableStateService } from '../shared/services/ag-table-state.service';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-ag-grid-table',
  standalone: true,
  imports: [AgGridAngular],
  templateUrl: './ag-grid-table.html',
  styleUrl: './ag-grid-table.scss',
})
export class AgGridTable {
  private readonly actionService = inject(AgTableActionService);
  private readonly state = inject(AgTableStateService);
  private readonly dateTimeSettings = inject(DateTimeSettingsService);

  readonly rowData = toSignal(this.state.getRowData(), { initialValue: [] });
  readonly highPriorityCount = computed(
    () => this.rowData().filter((row) => row.priority === Priority.High).length,
  );
  readonly mediumPriorityCount = computed(
    () => this.rowData().filter((row) => row.priority === Priority.Medium).length,
  );
  readonly lowPriorityCount = computed(
    () => this.rowData().filter((row) => row.priority === Priority.Low).length,
  );
  readonly gridTheme = themeQuartz.withParams({
    accentColor: 'var(--color-primary)',
    backgroundColor: 'var(--color-surface)',
    borderColor: 'var(--color-border)',
    borderRadius: 10,
    foregroundColor: 'var(--color-text)',
    headerBackgroundColor: 'var(--color-table-header)',
    headerTextColor: 'var(--color-text)',
  });
  readonly defaultColDef: ColDef<ActionTableRow> = {
    flex: 1,
    minWidth: 110,
    resizable: true,
    sortable: true,
  };
  readonly columnDefs: ColDef<ActionTableRow>[] = [
    { field: 'id', headerName: 'ID', maxWidth: 90 },
    { field: 'entityName', headerName: 'Entity name', minWidth: 190 },
    {
      field: 'dueDate',
      headerName: 'Due date',
      valueFormatter: ({ value }) =>
        value ? this.dateTimeSettings.formatDateTime(value) : '—',
      comparator: (left, right) => this.compareDates(left, right),
    },
    {
      field: 'priority',
      headerName: 'Priority',
      valueFormatter: ({ value }) =>
        value === Priority.High
          ? '↑ High'
          : value === Priority.Medium
            ? '— Medium'
            : value === Priority.Low
              ? '↓ Low'
              : '—',
    },
  ];

  constructor() {
    this.actionService.loadGridData();
  }

  private compareDates(
    left: Date | string | null | undefined,
    right: Date | string | null | undefined,
  ): number {
    const leftTime = this.toTimestamp(left);
    const rightTime = this.toTimestamp(right);
    if (leftTime === null || rightTime === null) {
      return leftTime === rightTime ? 0 : leftTime === null ? 1 : -1;
    }
    return leftTime - rightTime;
  }

  private toTimestamp(value: Date | string | null | undefined): number | null {
    if (value == null) {
      return null;
    }
    const timestamp = value instanceof Date ? value.getTime() : new Date(value).getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
  }
}
