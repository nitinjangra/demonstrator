import { TestBed } from '@angular/core/testing';
import { AgGridTable } from './ag-grid-table';
import { Priority } from '../../../shared/enums/priority.enum';

describe('AgGridTable', () => {
  let component: AgGridTable;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [AgGridTable] });
    component = TestBed.createComponent(AgGridTable).componentInstance;
  });

  it('formats present and missing due dates and each priority level', () => {
    const dueDate = component.columnDefs.find((column) => column.field === 'dueDate');
    const priority = component.columnDefs.find((column) => column.field === 'priority');
    const dateFormatter = dueDate?.valueFormatter as (params: { value: unknown }) => string;
    const priorityFormatter = priority?.valueFormatter as (params: { value: unknown }) => string;

    expect(dateFormatter({ value: null })).toBe('—');
    expect(dateFormatter({ value: '2024-01-05T13:07:00' })).toContain('05-01-2024');
    expect(priorityFormatter({ value: Priority.High })).toContain('High');
    expect(priorityFormatter({ value: Priority.Medium })).toContain('Medium');
    expect(priorityFormatter({ value: Priority.Low })).toContain('Low');
    expect(priorityFormatter({ value: undefined })).toBe('—');
  });

  it('orders valid dates and puts invalid or missing dates last', () => {
    const dueDate = component.columnDefs.find((column) => column.field === 'dueDate');
    const compare = dueDate?.comparator as (left: unknown, right: unknown) => number;

    expect(compare('2024-01-01', '2024-01-02')).toBeLessThan(0);
    expect(compare(new Date('2024-01-02'), new Date('2024-01-01'))).toBeGreaterThan(0);
    expect(compare(null, undefined)).toBe(0);
    expect(compare(null, '2024-01-01')).toBeGreaterThan(0);
    expect(compare('2024-01-01', null)).toBeLessThan(0);
    expect(compare('invalid', '2024-01-01')).toBeGreaterThan(0);
  });
});
