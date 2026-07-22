import { Priority } from '../../../../shared/enums/priority.enum';
import { ActionTableRow } from '../../../../shared/interfaces/actions-table.interface';

export const mockTableData: ActionTableRow[] = [
  {
    id: 12,
    entityName: 'cyber truck facelift',
    entityId: 'c26b4435-3bfd-4da5-a4f2-132ba09a1751',
    dueDate: new Date('2030-12-20T15:00:00'),
    priority: Priority['High'],
  },
  {
    id: 33,
    entityName: 'copilot insights',
    entityId: '8c6fccd7-080d-4805-a308-fe02e45556b5',
    dueDate: new Date('2027-6-25T15:00:00'),
  },
  {
    id: 28,
    entityName: 'Iphone fold insight',
    entityId: '0bab0396-1bc2-47e2-bc68-665815b10489',
    dueDate: new Date('2028-4-12T15:00:00'),
    priority: Priority['Medium'],
  },
];
