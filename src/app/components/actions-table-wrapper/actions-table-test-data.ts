import type { ActionTableRow } from '../../shared/interfaces/actions-table.interface';
import { Priority } from '../../shared/enums/priority.enum';

const names = [
  'Agricultural commodities update',
  'Business continuity plan',
  'Capital market summary',
  'Digital operations review',
  'Economic forecast',
  'Energy portfolio report',
  'Financial controls update',
  'Governance review',
  'Healthcare demand outlook',
  'Infrastructure investments',
  'Electric vehicle market outlook',
  'Legal compliance update',
  'Market expansion strategy',
  'Network resilience review',
  'Operational readiness',
  'Product pipeline report',
  'Quarterly strategy',
  'Revenue outlook',
  'Supply chain analysis',
  'Workforce update',
];

export const actionRowsForTests: ActionTableRow[] = names.map((entityName, index) => ({
  id: index + 1,
  entityName,
  entityId: `test-action-${index + 1}`,
  dueDate: new Date(Date.UTC(2026, 10, index + 1)).toISOString(),
  priority:
    index < 6
      ? Priority.High
      : index < 12
        ? Priority.Medium
        : index < 18
          ? Priority.Low
          : undefined,
}));

export function seedActionTableTestData(profile: 'admin' | 'standard' = 'admin'): void {
  localStorage.setItem('mock-action-table-data', JSON.stringify(actionRowsForTests));
  localStorage.setItem('active-user-profile', profile);
  localStorage.setItem('admin-mode', String(profile === 'admin'));
}

export function clearActionTableTestData(): void {
  localStorage.removeItem('mock-action-table-data');
  localStorage.removeItem('active-user-profile');
  localStorage.removeItem('active-tenant-id');
  localStorage.removeItem('admin-mode');
}
