import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MaterialTable } from './material-table';
import { ActionTableRow } from '../../../shared/interfaces/actions-table.interface';
import { Priority } from '../../../shared/enums/priority.enum';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

describe('MaterialTable', () => {
  let fixture: ComponentFixture<MaterialTable>;
  let queryParams: BehaviorSubject<ParamMap>;

  beforeEach(async () => {
    queryParams = new BehaviorSubject(convertToParamMap({}));
    await TestBed.configureTestingModule({
      imports: [MaterialTable],
      providers: [{ provide: ActivatedRoute, useValue: { queryParamMap: queryParams.asObservable() } }],
    }).compileComponents();
    fixture = TestBed.createComponent(MaterialTable);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should render sortable action columns and rows', () => {
    fixture.detectChanges();

    const table = fixture.nativeElement.querySelector('table[mat-table]') as HTMLTableElement;
    expect(table).not.toBeNull();
    const summary = fixture.nativeElement.querySelector('.actions-summary') as HTMLElement;
    expect(summary.textContent).toContain('20 actions');
    expect(summary.textContent).toContain('6 High');
    expect(table.querySelectorAll('th[mat-header-cell]').length).toBe(4);
    expect(table.querySelectorAll('tr[mat-row]').length).toBe(10);
    expect(fixture.componentInstance.dataSource.paginator?.pageSize).toBe(10);
    expect(fixture.componentInstance.dataSource.paginator?.length).toBe(20);

    const entityNameHeader = table.querySelector('.mat-column-entityName') as HTMLElement;
    entityNameHeader.click();
    fixture.detectChanges();

    expect(entityNameHeader.getAttribute('aria-sort')).toBe('ascending');
    expect(table.querySelector('tbody tr td.mat-column-entityName')?.textContent?.trim()).toBe(
      'Agricultural commodities update',
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

  it('paginates the actions with ten rows per page by default', () => {
    fixture.detectChanges();
    const paginator = fixture.componentInstance.dataSource.paginator;
    expect(paginator?.pageSize).toBe(10);
    expect(paginator?.length).toBe(20);

    paginator?.nextPage();
    fixture.detectChanges();

    expect(paginator?.pageIndex).toBe(1);
    expect(fixture.nativeElement.querySelectorAll('tr[mat-row]').length).toBe(10);
    expect(fixture.nativeElement.querySelector('tbody tr td.mat-column-entityName')?.textContent?.trim())
      .toBe('Electric vehicle market outlook');
  });

  it('does not advance beyond the last page and resets paging after a priority filter', async () => {
    fixture.detectChanges();
    const paginator = fixture.componentInstance.dataSource.paginator;
    paginator?.nextPage();
    paginator?.nextPage();
    fixture.detectChanges();
    expect(paginator?.pageIndex).toBe(1);

    queryParams.next(convertToParamMap({ priority: 'High' }));
    fixture.detectChanges();
    await fixture.whenStable();
    expect(fixture.componentInstance.selectedPriority()).toBe(Priority.High);
    expect(fixture.componentInstance.dataSource.paginator?.pageIndex).toBe(0);
    expect(fixture.componentInstance.dataSource.filteredData.length).toBe(6);
  });

  it('ignores an unsupported priority query value and leaves all rows visible', () => {
    queryParams.next(convertToParamMap({ priority: 'Urgent' }));
    fixture.detectChanges();

    expect(fixture.componentInstance.selectedPriority()).toBeNull();
    expect(fixture.componentInstance.routeAppliedPriority()).toBeNull();
    expect(fixture.componentInstance.dataSource.filter).toBe('');
    expect(fixture.componentInstance.dataSource.filteredData.length).toBe(20);
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

  it('applies the priority supplied by the route query parameter', async () => {
    queryParams.next(convertToParamMap({ priority: 'High', highlightActions: 'true', tab: 'actions' }));

    expect(fixture.componentInstance.selectedPriority()).toBe(Priority.High);
    expect(fixture.componentInstance.routeAppliedPriority()).toBe(Priority.High);
    expect(fixture.componentInstance.dataSource.filter).toBe('High');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('table')?.classList).toContain('table-route-highlight');
  });
});
