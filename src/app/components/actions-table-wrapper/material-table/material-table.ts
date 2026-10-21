import { Component, inject, signal, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { Priority } from '../../../shared/enums/priority.enum';
import { ActionTableRow } from '../../../shared/interfaces/actions-table.interface';
import { DateTimeSettingsService } from '../../../shared/services/date-time-settings.service';
import { AgTableActionService } from '../shared/services/ag-table-action.service';
import { AgTableStateService } from '../shared/services/ag-table-state.service';
import { PrioritySummaryComponent } from '../priority-summary/priority-summary';

@Component({
  selector: 'app-material-table',
  standalone: true,
  imports: [MatIconModule, MatSortModule, MatTableModule, PrioritySummaryComponent],
  templateUrl: './material-table.html',
  styleUrl: './material-table.scss',
})
export class MaterialTable {
  private readonly actionService = inject(AgTableActionService);
  private readonly state = inject(AgTableStateService);
  readonly dateTimeSettings = inject(DateTimeSettingsService);
  readonly Priority = Priority;
  readonly selectedPriority = signal<Priority | 'none' | null>(null);

  @ViewChild(MatSort)
  set matSort(sort: MatSort) {
    this.dataSource.sort = sort;
  }

  readonly displayedColumns = ['id', 'entityName', 'dueDate', 'priority'];
  readonly dataSource = new MatTableDataSource<ActionTableRow>();
  private readonly rowData = signal<ActionTableRow[]>([]);
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
    this.state
      .getRowData()
      .pipe(takeUntilDestroyed())
      .subscribe((rows) => {
        this.rowData.set(rows);
        this.dataSource.data = rows;
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
