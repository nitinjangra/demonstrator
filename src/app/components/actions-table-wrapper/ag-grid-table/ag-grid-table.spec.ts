import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgGridTable } from './ag-grid-table';
import { Priority } from '../../../shared/enums/priority.enum';
import { ActivatedRoute, convertToParamMap, ParamMap } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AgGridAngular } from 'ag-grid-angular';
import { By } from '@angular/platform-browser';
import { clearActionTableTestData, seedActionTableTestData } from '../actions-table-test-data';

describe('AgGridTable', () => {
  let component: AgGridTable;
  let fixture: ComponentFixture<AgGridTable>;
  let queryParams: BehaviorSubject<ParamMap>;

  beforeEach(() => {
    seedActionTableTestData();
    queryParams = new BehaviorSubject(convertToParamMap({}));
    TestBed.configureTestingModule({
      imports: [AgGridTable],
      providers: [{ provide: ActivatedRoute, useValue: { queryParamMap: queryParams.asObservable() } }],
    });
    fixture = TestBed.createComponent(AgGridTable);
    component = fixture.componentInstance;
  });

  afterEach(() => clearActionTableTestData());

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

  it('applies the priority supplied by the route query parameter', () => {
    queryParams.next(convertToParamMap({ priority: 'High', highlightActions: 'true', tab: 'actions' }));

    expect(component.selectedPriority()).toBe(Priority.High);
    expect(component.routeAppliedPriority()).toBe(Priority.High);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.ag-grid-frame')?.classList)
      .toContain('table-route-highlight');
  });

  it('enables pagination with ten rows per page by default', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    expect(fixture.nativeElement.querySelector('.ag-paging-panel')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.ag-paging-row-summary-panel')).not.toBeNull();
    const grid = fixture.debugElement.query(By.directive(AgGridAngular)).componentInstance as AgGridAngular;
    expect(grid.api.paginationGetPageSize()).toBe(10);
    expect(grid.api.paginationGetTotalPages()).toBe(2);
    grid.api.paginationGoToNextPage();
    grid.api.paginationGoToNextPage();
    expect(grid.api.paginationGetCurrentPage()).toBe(1);
  });

  it('ignores an unsupported priority query value and keeps the full data set', () => {
    queryParams.next(convertToParamMap({ priority: 'Urgent' }));

    expect(component.selectedPriority()).toBeNull();
    expect(component.routeAppliedPriority()).toBeNull();
    expect(component.rowData().length).toBe(20);
  });

  it('filters rows without a priority and toggles the selected priority off', () => {
    component.togglePriorityFilter('none');
    expect(component.rowData().length).toBe(2);
    component.togglePriorityFilter('none');
    expect(component.rowData().length).toBe(20);
    component.togglePriorityFilter(Priority.Low);
    expect(component.rowData().length).toBe(6);
    component.clearPriorityFilter();
    expect(component.selectedPriority()).toBeNull();
  });
});
