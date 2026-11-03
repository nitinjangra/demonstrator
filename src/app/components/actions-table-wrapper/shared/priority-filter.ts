import { Priority } from '../../../shared/enums/priority.enum';

export type PriorityFilter = Priority | 'none' | null;

export function parsePriorityFilter(value: string | null): PriorityFilter {
  if (value === 'none') {
    return 'none';
  }

  return Object.values(Priority).find((priority) => priority === value) ?? null;
}
