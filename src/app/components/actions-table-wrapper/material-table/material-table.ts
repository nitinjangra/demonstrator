import { Component, computed, DestroyRef, inject, signal, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Priority } from '../../../shared/enums/priority.enum';
import { ActionTableRow } from '../../../shared/interfaces/actions-table.interface';
import { DateTimeSettingsService } from '../../../shared/services/date-time-settings.service';
import { AgTableActionService } from '../shared/services/ag-table-action.service';
import { AgTableStateService } from '../shared/services/ag-table-state.service';
import { PrioritySummaryComponent } from '../priority-summary/priority-summary';
import { ActivatedRoute } from '@angular/router';
import { parsePriorityFilter } from '../shared/priority-filter';
import {
  compareActionUrgency,
  daysUntilActionDue,
  parseActionDate,
  relativeDueLabel,
} from '../shared/action-urgency';
import { UserSettingsService } from '../../../shared/services/user-settings.service';
import { LanguageSettingsService } from '../../../shared/services/language-settings.service';
import type { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-material-table',
  standalone: true,
  imports: [
    MatIconModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
    PrioritySummaryComponent,
  ],
  templateUrl: './material-table.html',
  styleUrl: './material-table.scss',
})
export class MaterialTable {
  private readonly actionService = inject(AgTableActionService);
  private readonly state = inject(AgTableStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly userSettings = inject(UserSettingsService);
  private readonly languageSettings = inject(LanguageSettingsService);
  private readonly destroyRef = inject(DestroyRef);
  private highlightTimeout?: ReturnType<typeof setTimeout>;
  private paginatorInstance?: MatPaginator;
  readonly dateTimeSettings = inject(DateTimeSettingsService);
  readonly Priority = Priority;
  readonly selectedPriority = signal<Priority | 'none' | null>(null);
  readonly routeAppliedPriority = signal<Priority | 'none' | null>(null);

  @ViewChild(MatSort)
  set matSort(sort: MatSort | undefined) {
    this.dataSource.sort = sort ?? null;
  }

  @ViewChild(MatPaginator)
  set paginator(paginator: MatPaginator | undefined) {
    this.paginatorInstance = paginator;
    if (paginator) paginator.pageSize = this.pageSize();
    this.dataSource.paginator = paginator ?? null;
  }

  readonly displayedColumns = ['entityName', 'dueDate', 'priority', 'id'];
  readonly dataSource = new MatTableDataSource<ActionTableRow>();
  readonly pageSizeOptions = [10, 20, 50];
  readonly pageSize = signal(10);
  private readonly rowData = signal<ActionTableRow[]>([]);
  readonly visibleRowData = computed(() => {
    const rows = this.rowData();
    const priority = this.selectedPriority();
    if (priority === 'none') return rows.filter((row) => !row.priority);
    return priority ? rows.filter((row) => row.priority === priority) : rows;
  });

  constructor() {
    this.dataSource.filterPredicate = (row, filter) =>
      filter === 'none' ? !row.priority : !filter || row.priority === filter;
    this.dataSource.sortingDataAccessor = (row, column) => {
      switch (column) {
        case 'id':
          return row.id;
        case 'entityName':
          return row.entityName;
        case 'dueDate':
          return this.isValidDate(row.dueDate) ? new Date(row.dueDate).getTime() : '';
        case 'priority':
          return row.priority ?? '';
        default:
          return '';
      }
    };
    const defaultSortData = this.dataSource.sortData.bind(this.dataSource);
    this.dataSource.sortData = (rows, sort) => {
      if (!sort.active || (sort.active === 'priority' && sort.direction === 'desc')) {
        return [...rows].sort(compareActionUrgency);
      }
      return defaultSortData(rows, sort);
    };

    const savedPageSize = Number(localStorage.getItem(this.pageSizeStorageKey));
    if (this.pageSizeOptions.includes(savedPageSize)) this.pageSize.set(savedPageSize);

    this.actionService.loadGridData();
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const priority = parsePriorityFilter(params.get('priority'));
      this.selectedPriority.set(priority);
      this.routeAppliedPriority.set(priority);
      if (this.highlightTimeout) clearTimeout(this.highlightTimeout);
      if (priority) {
        this.highlightTimeout = setTimeout(() => this.routeAppliedPriority.set(null), 2000);
      }
      this.dataSource.filter = priority ?? '';
    });
    this.state
      .getRowData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((rows) => {
        this.rowData.set(rows);
        this.dataSource.data = rows;
      });
    this.destroyRef.onDestroy(() => {
      if (this.highlightTimeout) clearTimeout(this.highlightTimeout);
    });
  }

  togglePriorityFilter(priority: Priority | 'none'): void {
    this.selectedPriority.update((selected) => {
      const nextPriority = selected === priority ? null : priority;
      this.dataSource.filter = nextPriority ?? '';
      return nextPriority;
    });
  }

  clearPriorityFilter(): void {
    this.selectedPriority.set(null);
    this.dataSource.filter = '';
  }

  relativeDueLabel(value: ActionTableRow['dueDate']): string | null {
    return relativeDueLabel(value, new Date(), this.languageSettings.language());
  }

  isOverdue(value: ActionTableRow['dueDate']): boolean {
    const offset = daysUntilActionDue(value);
    return offset !== null && offset < 0;
  }

  dueDateTime(value: ActionTableRow['dueDate']): string | null {
    return parseActionDate(value)?.toISOString() ?? null;
  }

  onPageChange(event: PageEvent): void {
    this.pageSize.set(event.pageSize);
    localStorage.setItem(this.pageSizeStorageKey, String(event.pageSize));
  }

  private get pageSizeStorageKey(): string {
    return `actions-page-size:${this.userSettings.tenantId()}`;
  }

  isValidDate(value: ActionTableRow['dueDate']): value is Date | string {
    if (value === null) {
      return false;
    }

    const parsed = value instanceof Date ? value : new Date(value);
    return Number.isFinite(parsed.getTime());
  }
}
