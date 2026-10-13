import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialTable } from './material-table';

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
    expect(summary.textContent).toContain('3 high priority');
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
});
