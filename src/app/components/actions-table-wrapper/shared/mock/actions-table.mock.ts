import { Priority } from '../../../../shared/enums/priority.enum';
import { ActionTableRow } from '../../../../shared/interfaces/actions-table.interface';

function dueInDays(days: number): Date {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + days);
  dueDate.setHours(15, 0, 0, 0);
  return dueDate;
}

export const mockTableData: ActionTableRow[] = [
  {
    id: 12,
    entityName: 'Cyber truck facelift',
    entityId: 'c26b4435-3bfd-4da5-a4f2-132ba09a1751',
    dueDate: dueInDays(-3),
    priority: Priority['High'],
  },
  {
    id: 33,
    entityName: 'Copilot insights',
    entityId: '8c6fccd7-080d-4805-a308-fe02e45556b5',
    dueDate: dueInDays(5),
    priority: Priority['Low'],
  },
  {
    id: 28,
    entityName: 'iPhone fold insight',
    entityId: '0bab0396-1bc2-47e2-bc68-665815b10489',
    dueDate: dueInDays(-1),
    priority: Priority['Medium'],
  },
  {
    id: 303,
    entityName: 'DeepSeek insights',
    entityId: '8c6fccd7-080d-4805-a308-fe02e45556b5',
    dueDate: dueInDays(0),
    priority: Priority['Medium'],
  },
  {
    id: 45,
    entityName: 'Michelin new product insights',
    entityId: '8c6fccd7-080d-4805-a308-fe02e45556b5',
    dueDate: dueInDays(1),
    priority: Priority['High'],
  },
  {
    id: 88,
    entityName: 'Windows insights',
    entityId: '8c6fccd7-080d-4805-a308-fe02e45556b5',
    dueDate: dueInDays(6),
    priority: Priority['Low'],
  },
  {
    id: 93,
    entityName: 'Berkshire investments insights',
    entityId: '8c6fccd7-080d-4805-a308-fe02e45556b5',
    dueDate: dueInDays(12),
    priority: Priority['Medium'],
  },
  {
    id: 73,
    entityName: 'Samsung insights',
    entityId: '8c6fccd7-080d-4805-a308-fe02e45556b5',
    dueDate: dueInDays(2),
    priority: Priority['Low'],
  },
  {
    id: 213,
    entityName: 'Porsche insights',
    entityId: '8c6fccd7-080d-4805-a308-fe02e45556b5',
    dueDate: dueInDays(-7),
    priority: Priority['High'],
  },
  {
    id: 49,
    entityName: 'Linux insights',
    entityId: '8c6fccd7-080d-4805-a308-fe02e45556b5',
    dueDate: dueInDays(7),
  },
  {
    id: 101,
    entityName: 'Electric vehicle market outlook',
    entityId: 'a1913e23-0c75-49f4-b6b0-508ef2d3fa01',
    dueDate: dueInDays(30),
    priority: Priority.High,
  },
  {
    id: 102,
    entityName: 'Cloud infrastructure review',
    entityId: 'a1913e23-0c75-49f4-b6b0-508ef2d3fa02',
    dueDate: dueInDays(14),
    priority: Priority.Medium,
  },
  {
    id: 103,
    entityName: 'Consumer electronics trends',
    entityId: 'a1913e23-0c75-49f4-b6b0-508ef2d3fa03',
    dueDate: dueInDays(20),
    priority: Priority.Low,
  },
  {
    id: 104,
    entityName: 'Renewable energy pipeline',
    entityId: 'a1913e23-0c75-49f4-b6b0-508ef2d3fa04',
    dueDate: dueInDays(35),
    priority: Priority.High,
  },
  {
    id: 105,
    entityName: 'Healthcare technology signals',
    entityId: 'a1913e23-0c75-49f4-b6b0-508ef2d3fa05',
    dueDate: dueInDays(45),
    priority: Priority.Medium,
  },
  {
    id: 106,
    entityName: 'Global logistics capacity',
    entityId: 'a1913e23-0c75-49f4-b6b0-508ef2d3fa06',
    dueDate: dueInDays(60),
    priority: Priority.Low,
  },
  {
    id: 107,
    entityName: 'Semiconductor demand review',
    entityId: 'a1913e23-0c75-49f4-b6b0-508ef2d3fa07',
    dueDate: dueInDays(75),
    priority: Priority.High,
  },
  {
    id: 108,
    entityName: 'Small business software outlook',
    entityId: 'a1913e23-0c75-49f4-b6b0-508ef2d3fa08',
    dueDate: dueInDays(90),
    priority: Priority.Medium,
  },
  {
    id: 109,
    entityName: 'Agricultural commodities update',
    entityId: 'a1913e23-0c75-49f4-b6b0-508ef2d3fa09',
    dueDate: dueInDays(120),
    priority: Priority.Low,
  },
  {
    id: 110,
    entityName: 'Emerging markets briefing',
    entityId: 'a1913e23-0c75-49f4-b6b0-508ef2d3fa10',
    dueDate: dueInDays(180),
  },
];
