import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, ICellRendererParams } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import { Priority } from '../../../shared/enums/priority.enum';
import { ActionTableRow } from '../../../shared/interfaces/actions-table.interface';
import { DateTimeSettingsService } from '../../../shared/services/date-time-settings.service';
import { PrioritySummaryComponent } from '../priority-summary/priority-summary';
import { AgTableActionService } from '../shared/services/ag-table-action.service';
import { AgTableStateService } from '../shared/services/ag-table-state.service';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-ag-grid-table',
  standalone: true,
  imports: [AgGridAngular, PrioritySummaryComponent],
  templateUrl: './ag-grid-table.html',
  styleUrl: './ag-grid-table.scss',
})
export class AgGridTable {
  private readonly actionService = inject(AgTableActionService);
  private readonly state = inject(AgTableStateService);
  private readonly dateTimeSettings = inject(DateTimeSettingsService);

  readonly Priority = Priority;
  readonly sourceRowData = toSignal(this.state.getRowData(), { initialValue: [] });
  readonly selectedPriority = signal<Priority | 'none' | null>(null);
  readonly rowData = computed(() => {
    const priority = this.selectedPriority();
    if (priority === 'none') {
      return this.sourceRowData().filter((row) => !row.priority);
    }
    return priority ? this.sourceRowData().filter((row) => row.priority === priority) : this.sourceRowData();
  });
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
      cellRenderer: ({ value }: ICellRendererParams<ActionTableRow, Priority | null>) =>
        this.renderPriorityBadge(value),
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

  togglePriorityFilter(priority: Priority | 'none'): void {
    this.selectedPriority.update((selected) => (selected === priority ? null : priority));
  }

  clearPriorityFilter(): void {
    this.selectedPriority.set(null);
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

  private renderPriorityBadge(value: unknown): HTMLElement {
    const badge = document.createElement('span');
    const label = document.createElement('span');
    const icon = document.createElement('span');
    const priority = value as Priority;

    if (priority !== Priority.High && priority !== Priority.Medium && priority !== Priority.Low) {
      badge.className = 'no-priority';
      badge.textContent = '—';
      badge.setAttribute('aria-label', 'No priority');
      return badge;
    }

    const modifier = priority.toLowerCase();
    badge.className = `priority-badge priority-badge--${modifier}`;
    icon.className = 'priority-badge__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent = priority === Priority.High ? '↑' : priority === Priority.Low ? '↓' : '−';
    label.textContent = priority;
    badge.append(icon, label);

    return badge;
  }

  private toTimestamp(value: Date | string | null | undefined): number | null {
    if (value == null) {
      return null;
    }
    const timestamp = value instanceof Date ? value.getTime() : new Date(value).getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
  }
}
