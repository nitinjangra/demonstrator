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

@Component({
  selector: 'app-material-table',
  standalone: true,
  imports: [MatIconModule, MatPaginatorModule, MatSortModule, MatTableModule, PrioritySummaryComponent],
  templateUrl: './material-table.html',
  styleUrl: './material-table.scss',
})
export class MaterialTable {
  private readonly actionService = inject(AgTableActionService);
  private readonly state = inject(AgTableStateService);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private highlightTimeout?: ReturnType<typeof setTimeout>;
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
    this.dataSource.paginator = paginator ?? null;
  }

  readonly displayedColumns = ['id', 'entityName', 'dueDate', 'priority'];
  readonly dataSource = new MatTableDataSource<ActionTableRow>();
  readonly pageSizeOptions = [10, 20, 50];
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

  isValidDate(value: ActionTableRow['dueDate']): value is Date | string {
    if (value === null) {
      return false;
    }

    const parsed = value instanceof Date ? value : new Date(value);
    return Number.isFinite(parsed.getTime());
  }
}
