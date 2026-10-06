import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Priority } from '../../../shared/enums/priority.enum';
import { ActionTableRow } from '../../../shared/interfaces/actions-table.interface';
import { AgTableActionService } from './services/ag-table-action.service';
import { AgTableStateService } from './services/ag-table-state.service';

type SortColumn = 'id' | 'entityName' | 'dueDate' | 'priority';
type SortDirection = 'ascending' | 'descending';

@Component({
  selector: 'app-actions-table',
  imports: [DatePipe],
  templateUrl: './ag-actions-table.html',
  styleUrl: './ag-actions-table.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionsTable {
  private readonly actionService = inject(AgTableActionService);
  private readonly state = inject(AgTableStateService);

  private readonly rows = toSignal(this.state.getRowData(), { initialValue: [] });
  private readonly sort = signal<{ column: SortColumn; direction: SortDirection } | null>(null);

  readonly sortedRows = computed(() => {
    const sort = this.sort();
    const rows = this.rows();
    if (!sort) {
      return rows;
    }

    return [...rows].sort((left, right) =>
      this.compareRows(left, right, sort.column, sort.direction),
    );
  });
  readonly highPriorityCount = computed(
    () => this.rows().filter((row) => row.priority === Priority.High).length,
  );
  readonly actionCount = computed(() => this.rows().length);

  constructor() {
    this.actionService.loadGridData();
  }

  isValidDate(value: ActionTableRow['dueDate']): value is Date | string {
    if (value === null) {
      return false;
    }

    const parsed = value instanceof Date ? value : new Date(value);
    return Number.isFinite(parsed.getTime());
  }

  sortBy(column: SortColumn): void {
    this.sort.update((current) => ({
      column,
      direction:
        current?.column === column && current.direction === 'ascending'
          ? 'descending'
          : 'ascending',
    }));
  }

  sortDirection(column: SortColumn): 'ascending' | 'descending' | 'none' {
    const current = this.sort();
    return current?.column === column ? current.direction : 'none';
  }

  sortIndicator(column: SortColumn): string {
    const direction = this.sortDirection(column);
    return direction === 'ascending' ? '↑' : direction === 'descending' ? '↓' : '';
  }

  private compareRows(
    left: ActionTableRow,
    right: ActionTableRow,
    column: SortColumn,
    direction: SortDirection,
  ): number {
    if (column === 'dueDate') {
      const leftDate = this.isValidDate(left.dueDate) ? new Date(left.dueDate).getTime() : null;
      const rightDate = this.isValidDate(right.dueDate)
        ? new Date(right.dueDate).getTime()
        : null;

      if (leftDate === null || rightDate === null) {
        return leftDate === rightDate ? 0 : leftDate === null ? 1 : -1;
      }

      return (leftDate - rightDate) * (direction === 'ascending' ? 1 : -1);
    }

    const leftValue = left[column] ?? '';
    const rightValue = right[column] ?? '';
    const comparison =
      typeof leftValue === 'number' && typeof rightValue === 'number'
        ? leftValue - rightValue
        : String(leftValue).localeCompare(String(rightValue));

    return comparison * (direction === 'ascending' ? 1 : -1);
  }
}
