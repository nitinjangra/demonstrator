import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, ICellRendererParams, PaginationChangedEvent } from 'ag-grid-community';
import { AllCommunityModule, ModuleRegistry, themeQuartz } from 'ag-grid-community';
import { Priority } from '../../../shared/enums/priority.enum';
import { ActionTableRow } from '../../../shared/interfaces/actions-table.interface';
import { DateTimeSettingsService } from '../../../shared/services/date-time-settings.service';
import { PrioritySummaryComponent } from '../priority-summary/priority-summary';
import { AgTableActionService } from '../shared/services/ag-table-action.service';
import { AgTableStateService } from '../shared/services/ag-table-state.service';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { parsePriorityFilter } from '../shared/priority-filter';
import {
  compareActionUrgency,
  daysUntilActionDue,
  parseActionDate,
  relativeDueLabel,
} from '../shared/action-urgency';
import { LanguageSettingsService } from '../../../shared/services/language-settings.service';
import { UserSettingsService } from '../../../shared/services/user-settings.service';
import { LoadingComponent } from '../../../shared/components/loading/loading.component';
import { MatButtonModule } from '@angular/material/button';

ModuleRegistry.registerModules([AllCommunityModule]);

@Component({
  selector: 'app-ag-grid-table',
  standalone: true,
  imports: [
    AgGridAngular,
    MatButtonModule,
    MatIconModule,
    LoadingComponent,
    PrioritySummaryComponent,
  ],
  templateUrl: './ag-grid-table.html',
  styleUrl: './ag-grid-table.scss',
})
export class AgGridTable {
  private readonly actionService = inject(AgTableActionService);
  private readonly state = inject(AgTableStateService);
  readonly loadStatus = this.state.loadStatus;
  readonly retryLoad = () => this.actionService.loadGridData();
  private readonly dateTimeSettings = inject(DateTimeSettingsService);
  private readonly languageSettings = inject(LanguageSettingsService);
  private readonly userSettings = inject(UserSettingsService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private highlightTimeout?: ReturnType<typeof setTimeout>;

  readonly Priority = Priority;
  readonly sourceRowData = toSignal(this.state.getRowData(), { initialValue: [] });
  readonly selectedPriority = signal<Priority | 'none' | null>(null);
  readonly pageSize = signal(10);
  readonly routeAppliedPriority = signal<Priority | 'none' | null>(null);
  readonly rowData = computed(() => {
    const priority = this.selectedPriority();
    if (priority === 'none') {
      return this.sourceRowData().filter((row) => !row.priority);
    }
    return priority
      ? this.sourceRowData().filter((row) => row.priority === priority)
      : this.sourceRowData();
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
    {
      field: 'entityName',
      headerName: 'Action',
      minWidth: 190,
      maxWidth: 320,
      tooltipField: 'entityName',
    },
    {
      field: 'dueDate',
      headerName: 'Due date',
      minWidth: 240,
      cellRenderer: ({ value }: ICellRendererParams<ActionTableRow, Date | string | null>) =>
        this.renderDueDate(value),
      valueFormatter: ({ value }) =>
        value ? this.dateTimeSettings.formatDateOnly(value, this.languageSettings.language()) : '—',
      comparator: (left, right) => this.compareDates(left, right),
    },
    {
      field: 'priority',
      headerName: 'Priority',
      minWidth: 128,
      sort: 'desc',
      sortIndex: 0,
      cellRenderer: ({ value }: ICellRendererParams<ActionTableRow, Priority | null>) =>
        this.renderPriorityBadge(value),
      comparator: (_left, _right, nodeA, nodeB) => {
        if (!nodeA.data) return nodeB.data ? 1 : 0;
        if (!nodeB.data) return -1;
        return compareActionUrgency(nodeB.data, nodeA.data);
      },
      valueFormatter: ({ value }) =>
        value === Priority.High
          ? '↑ High'
          : value === Priority.Medium
            ? '— Medium'
            : value === Priority.Low
              ? '↓ Low'
              : '—',
    },
    { field: 'id', headerName: 'ID', maxWidth: 90 },
  ];

  constructor() {
    this.actionService.loadGridData();
    const savedPageSize = Number(localStorage.getItem(this.pageSizeStorageKey));
    if ([10, 20, 50].includes(savedPageSize)) this.pageSize.set(savedPageSize);

    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const priority = parsePriorityFilter(params.get('priority'));
      this.selectedPriority.set(priority);
      this.routeAppliedPriority.set(priority);
      if (this.highlightTimeout) clearTimeout(this.highlightTimeout);
      if (priority) {
        this.highlightTimeout = setTimeout(() => this.routeAppliedPriority.set(null), 2000);
      }
    });
    this.destroyRef.onDestroy(() => {
      if (this.highlightTimeout) clearTimeout(this.highlightTimeout);
    });
  }

  togglePriorityFilter(priority: Priority | 'none'): void {
    this.selectedPriority.update((selected) => (selected === priority ? null : priority));
  }

  clearPriorityFilter(): void {
    this.selectedPriority.set(null);
  }

  onPaginationChanged(event: PaginationChangedEvent): void {
    const pageSize = event.api.paginationGetPageSize();
    if (![10, 20, 50].includes(pageSize)) return;
    this.pageSize.set(pageSize);
    localStorage.setItem(this.pageSizeStorageKey, String(pageSize));
  }

  private get pageSizeStorageKey(): string {
    return `actions-page-size:${this.userSettings.tenantId()}`;
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
    icon.className = 'material-icons priority-badge__icon';
    icon.setAttribute('aria-hidden', 'true');
    icon.textContent =
      priority === Priority.High
        ? 'arrow_upward'
        : priority === Priority.Low
          ? 'arrow_downward'
          : 'remove';
    label.textContent = priority;
    badge.append(icon, label);

    return badge;
  }

  private renderDueDate(value: Date | string | null | undefined): HTMLElement {
    const cell = document.createElement('span');
    cell.className = 'due-date-cell';
    const date = parseActionDate(value ?? null);
    if (!date) {
      cell.textContent = '—';
      cell.setAttribute('aria-label', 'No due date');
      return cell;
    }

    const time = document.createElement('time');
    time.dateTime = date.toISOString();
    time.title = this.dateTimeSettings.formatDateTooltip(date, this.languageSettings.language());
    time.textContent = this.dateTimeSettings.formatDateOnly(date, this.languageSettings.language());
    cell.append(time);

    const dueLabel = relativeDueLabel(value ?? null, new Date(), this.languageSettings.language());
    if (dueLabel) {
      const cue = document.createElement('span');
      cue.className = 'due-date-cue';
      const dueOffset = daysUntilActionDue(value ?? null);
      if (dueOffset !== null && dueOffset < 0) cue.classList.add('due-date-cue--overdue');
      cue.textContent = dueLabel;
      cell.append(cue);
    }

    return cell;
  }

  private toTimestamp(value: Date | string | null | undefined): number | null {
    if (value == null) {
      return null;
    }
    const timestamp = value instanceof Date ? value.getTime() : new Date(value).getTime();
    return Number.isFinite(timestamp) ? timestamp : null;
  }
}
