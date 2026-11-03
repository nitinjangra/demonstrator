import { Priority } from '../../../shared/enums/priority.enum';
import { parsePriorityFilter } from './priority-filter';

describe('parsePriorityFilter', () => {
  it('accepts each supported priority and the no-priority filter', () => {
    expect(parsePriorityFilter(Priority.High)).toBe(Priority.High);
    expect(parsePriorityFilter(Priority.Medium)).toBe(Priority.Medium);
    expect(parsePriorityFilter(Priority.Low)).toBe(Priority.Low);
    expect(parsePriorityFilter('none')).toBe('none');
  });

  it('returns null for missing or unsupported priorities', () => {
    expect(parsePriorityFilter(null)).toBeNull();
    expect(parsePriorityFilter('Urgent')).toBeNull();
  });
});
