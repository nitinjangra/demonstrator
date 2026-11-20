import { Priority } from '../../../shared/enums/priority.enum';
import type { ActionTableRow } from '../../../shared/interfaces/actions-table.interface';
import {
  compareActionUrgency,
  daysUntilActionDue,
  parseActionDate,
  relativeDueLabel,
} from './action-urgency';

describe('action urgency helpers', () => {
  const today = new Date(2024, 0, 10, 12);
  const row = (id: number, dueDate: string | null, priority?: Priority): ActionTableRow => ({
    id,
    entityId: `entity-${id}`,
    entityName: `Action ${id}`,
    dueDate,
    ...(priority ? { priority } : {}),
  });

  it('parses valid date-only and timestamp values while rejecting missing or invalid values', () => {
    expect(parseActionDate('2024-01-05')?.getFullYear()).toBe(2024);
    expect(parseActionDate('2024-01-05T13:07:00')?.getHours()).toBe(13);
    expect(parseActionDate(null)).toBeNull();
    expect(parseActionDate('not a date')).toBeNull();
    expect(parseActionDate(new Date(Number.NaN))).toBeNull();
  });

  it('calculates relative days across day boundaries and handles missing dates', () => {
    expect(daysUntilActionDue('2024-01-09', today)).toBe(-1);
    expect(daysUntilActionDue('2024-01-10', today)).toBe(0);
    expect(daysUntilActionDue('2024-01-12', today)).toBe(2);
    expect(daysUntilActionDue(null, today)).toBeNull();
  });

  it('provides English and Arabic relative cues and omits distant or invalid dates', () => {
    expect(relativeDueLabel('2024-01-09', today, 'en-US')).toBe('Overdue 1 day');
    expect(relativeDueLabel('2024-01-10', today, 'en-US')).toBe('Due today');
    expect(relativeDueLabel('2024-01-12', today, 'en-US')).toBe('In 2 days');
    expect(relativeDueLabel('2024-01-20', today, 'en-US')).toBeNull();
    expect(relativeDueLabel('not a date', today, 'en-US')).toBeNull();
    expect(relativeDueLabel('2024-01-10', today, 'ar')).toContain('اليوم');
  });

  it('sorts overdue items first, then by priority, due date, and id', () => {
    const rows = [
      row(5, '2024-01-11', Priority.High),
      row(4, '2024-01-09', Priority.Low),
      row(3, '2024-01-11', Priority.Medium),
      row(2, '2024-01-11', Priority.High),
      row(1, '2024-01-08', Priority.High),
      row(6, null),
    ];

    expect(
      rows.sort((left, right) => compareActionUrgency(left, right, today)).map(({ id }) => id),
    ).toEqual([1, 4, 2, 5, 3, 6]);
  });
});
