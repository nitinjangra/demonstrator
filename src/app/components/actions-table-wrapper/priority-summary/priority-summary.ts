import { Component, computed, input, output } from '@angular/core';
import { Priority } from '../../../shared/enums/priority.enum';
import { ActionTableRow } from '../../../shared/interfaces/actions-table.interface';

type PriorityFilter = Priority | 'none';

@Component({
  selector: 'app-priority-summary',
  standalone: true,
  templateUrl: './priority-summary.html',
  styleUrl: './priority-summary.scss',
})
export class PrioritySummaryComponent {
  readonly rowData = input.required<ActionTableRow[]>();
  readonly selectedPriority = input<PriorityFilter | null>(null);
  readonly prioritySelected = output<PriorityFilter>();
  readonly filterCleared = output<void>();

  readonly filters: {
    value: PriorityFilter;
    label: string;
    countKey: 'high' | 'medium' | 'low' | 'none';
    className: string;
    clearLabel: string;
  }[] = [
    {
      value: Priority.High,
      label: 'High',
      countKey: 'high',
      className: 'high',
      clearLabel: 'Clear high priority filter',
    },
    {
      value: Priority.Medium,
      label: 'Medium',
      countKey: 'medium',
      className: 'medium',
      clearLabel: 'Clear medium priority filter',
    },
    {
      value: Priority.Low,
      label: 'Low',
      countKey: 'low',
      className: 'low',
      clearLabel: 'Clear low priority filter',
    },
    {
      value: 'none',
      label: 'No priority',
      countKey: 'none',
      className: 'none',
      clearLabel: 'Clear no priority filter',
    },
  ];

  readonly counts = computed(() => {
    const rows = this.rowData();
    return {
      high: rows.filter((row) => row.priority === Priority.High).length,
      medium: rows.filter((row) => row.priority === Priority.Medium).length,
      low: rows.filter((row) => row.priority === Priority.Low).length,
      none: rows.filter((row) => !row.priority).length,
    };
  });
}
