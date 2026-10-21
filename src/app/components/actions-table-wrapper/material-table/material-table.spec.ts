import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialTable } from './material-table';
import { ActionTableRow } from '../../../shared/interfaces/actions-table.interface';

describe('MaterialTable', () => {
  let fixture: ComponentFixture<MaterialTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MaterialTable] }).compileComponents();
    fixture = TestBed.createComponent(MaterialTable);
    await fixture.whenStable();
  });

  it('should render sortable action columns and rows', () => {
    fixture.detectChanges();

    const table = fixture.nativeElement.querySelector('table[mat-table]') as HTMLTableElement;
    expect(table).not.toBeNull();
    const summary = fixture.nativeElement.querySelector('.actions-summary') as HTMLElement;
    expect(summary.textContent).toContain('10 actions');
    expect(summary.textContent).toContain('3 High');
    expect(table.querySelectorAll('th[mat-header-cell]').length).toBe(4);
    expect(table.querySelectorAll('tr[mat-row]').length).toBe(10);

    const entityNameHeader = table.querySelector('.mat-column-entityName') as HTMLElement;
    entityNameHeader.click();
    fixture.detectChanges();

    expect(entityNameHeader.getAttribute('aria-sort')).toBe('ascending');
    expect(table.querySelector('tbody tr td.mat-column-entityName')?.textContent?.trim()).toBe(
      'Berkshire investments insights',
    );
  });

  it('uses each supported sort accessor and an empty fallback for unknown columns', () => {
    const row: ActionTableRow = {
      id: 42,
      entityName: 'Example',
      entityId: 'example-id',
      dueDate: '2024-01-05',
      priority: undefined,
    };
    const accessor = fixture.componentInstance.dataSource.sortingDataAccessor;

    expect(accessor(row, 'id')).toBe(42);
    expect(accessor(row, 'entityName')).toBe('Example');
    expect(accessor(row, 'dueDate')).toBe(new Date('2024-01-05').getTime());
    expect(accessor(row, 'priority')).toBe('');
    expect(accessor(row, 'other-column')).toBe('');
  });

  it('sorts invalid and missing due dates as empty values', () => {
    const base = { id: 1, entityName: 'Example', entityId: 'example-id' };
    expect(fixture.componentInstance.isValidDate(null)).toBeFalse();
    expect(fixture.componentInstance.isValidDate('invalid')).toBeFalse();
    expect(fixture.componentInstance.isValidDate(new Date('invalid'))).toBeFalse();
    expect(fixture.componentInstance.isValidDate(new Date(2024, 0, 5))).toBeTrue();
    expect(
      fixture.componentInstance.dataSource.sortingDataAccessor(
        { ...base, dueDate: null },
        'dueDate',
      ),
    ).toBe('');
    expect(
      fixture.componentInstance.dataSource.sortingDataAccessor(
        { ...base, dueDate: 'invalid' },
        'dueDate',
      ),
    ).toBe('');
  });
});
