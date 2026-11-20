import { Priority } from '../../../shared/enums/priority.enum';
import type { ActionTableRow } from '../../../shared/interfaces/actions-table.interface';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export function parseActionDate(value: ActionTableRow['dueDate']): Date | null {
  if (value === null) return null;
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value : null;
  }

  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  const date = dateOnly
    ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]))
    : new Date(value);
  return Number.isFinite(date.getTime()) ? date : null;
}

export function daysUntilActionDue(
  value: ActionTableRow['dueDate'],
  now = new Date(),
): number | null {
  const date = parseActionDate(value);
  if (!date) return null;

  const dueDay = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((dueDay - today) / MILLISECONDS_PER_DAY);
}

export function relativeDueLabel(
  value: ActionTableRow['dueDate'],
  now = new Date(),
  locale = document.documentElement.lang || 'en-US',
): string | null {
  const daysUntilDue = daysUntilActionDue(value, now);
  if (daysUntilDue === null) return null;
  if (locale.startsWith('ar')) {
    if (daysUntilDue < 0)
      return `متأخر ${Math.abs(daysUntilDue)} ${Math.abs(daysUntilDue) === 1 ? 'يوم' : 'أيام'}`;
    if (daysUntilDue === 0) return 'مستحق اليوم';
    if (daysUntilDue <= 7) return `خلال ${daysUntilDue} ${daysUntilDue === 1 ? 'يوم' : 'أيام'}`;
    return null;
  }
  if (daysUntilDue < 0) {
    const daysOverdue = Math.abs(daysUntilDue);
    return `Overdue ${daysOverdue} ${daysOverdue === 1 ? 'day' : 'days'}`;
  }
  if (daysUntilDue === 0) return 'Due today';
  if (daysUntilDue <= 7) return `In ${daysUntilDue} ${daysUntilDue === 1 ? 'day' : 'days'}`;
  return null;
}

export function compareActionUrgency(
  left: ActionTableRow,
  right: ActionTableRow,
  now = new Date(),
): number {
  const leftDueOffset = daysUntilActionDue(left.dueDate, now);
  const rightDueOffset = daysUntilActionDue(right.dueDate, now);
  const leftOverdue = leftDueOffset !== null && leftDueOffset < 0;
  const rightOverdue = rightDueOffset !== null && rightDueOffset < 0;
  if (leftOverdue !== rightOverdue) return leftOverdue ? -1 : 1;

  const priorityOrder = (priority: Priority | undefined): number => {
    switch (priority) {
      case Priority.High:
        return 0;
      case Priority.Medium:
        return 1;
      case Priority.Low:
        return 2;
      default:
        return 3;
    }
  };
  const priorityDifference = priorityOrder(left.priority) - priorityOrder(right.priority);
  if (priorityDifference !== 0) return priorityDifference;

  const leftTime = parseActionDate(left.dueDate)?.getTime() ?? Number.POSITIVE_INFINITY;
  const rightTime = parseActionDate(right.dueDate)?.getTime() ?? Number.POSITIVE_INFINITY;
  return leftTime - rightTime || left.id - right.id;
}
