import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActionTableRow } from '../../../shared/interfaces/actions-table.interface';
import { AgTableStateService } from './services/ag-table-state.service';

import { ActionsTable } from './ag-actions-table';

describe('ActionsTable', () => {
  let component: ActionsTable;
  let fixture: ComponentFixture<ActionsTable>;
  let state: AgTableStateService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionsTable],
    }).compileComponents();

    fixture = TestBed.createComponent(ActionsTable);
    component = fixture.componentInstance;
    state = TestBed.inject(AgTableStateService);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render actions in a semantic table with sortable column headings', () => {
    fixture.detectChanges();
    const table = fixture.nativeElement.querySelector('table') as HTMLTableElement;

    expect(table).not.toBeNull();
    expect(table.querySelectorAll('thead th[scope="col"]').length).toBe(4);
    expect(table.querySelectorAll('tbody tr').length).toBe(10);
    expect(table.querySelector('caption')?.textContent).toContain('Select a column heading to sort');
  });

  it('should reject invalid due-date values', () => {
    expect(component.isValidDate('Invalid Date')).toBeFalse();
    expect(component.isValidDate(new Date('invalid'))).toBeFalse();
    expect(component.isValidDate(null)).toBeFalse();
  });

  it('should render an accessible fallback for missing and invalid due dates', () => {
    const rows: ActionTableRow[] = [
      { id: 1, entityName: 'Missing date', entityId: 'entity-1', dueDate: null },
      { id: 2, entityName: 'Invalid date', entityId: 'entity-2', dueDate: 'Invalid Date' },
    ];
    state.setRowData(rows);
    fixture.detectChanges();

    const fallbacks = Array.from(
      fixture.nativeElement.querySelectorAll('.no-due-date'),
    ) as HTMLElement[];
    expect(fallbacks.length).toBe(2);
    expect(fallbacks.map((element) => element.textContent.trim())).toEqual(['—', '—']);
    expect(fallbacks.map((element) => element.getAttribute('aria-label'))).toEqual([
      'No due date',
      'No due date',
    ]);
  });

  it('should give rows without a priority a meaningful accessible label', () => {
    fixture.detectChanges();

    const noPriority = fixture.nativeElement.querySelector('.no-priority') as HTMLElement;
    expect(noPriority.textContent.trim()).toBe('—');
    expect(noPriority.getAttribute('aria-label')).toBe('No priority');
  });

  it('should sort rows when a column heading is selected', () => {
    const entityNameHeader = fixture.nativeElement.querySelector(
      'th[scope="col"]:nth-child(2) button',
    ) as HTMLButtonElement;

    entityNameHeader.click();
    fixture.detectChanges();

    const firstEntity = fixture.nativeElement.querySelector('tbody tr td.entity-name');
    expect(firstEntity.textContent.trim()).toBe('Berkshire investments insights');
    expect(entityNameHeader.closest('th')?.getAttribute('aria-sort')).toBe('ascending');
  });
});
