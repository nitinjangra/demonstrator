import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { FeatureToggleService } from '../../shared/services/feature-toggle.service';
import { AgTableStateService } from '../actions-table-wrapper/shared/services/ag-table-state.service';
import { ActionTableRow } from '../../shared/interfaces/actions-table.interface';
import { routes } from '../../app.routes';
import { Dashboard } from './dashboard';
import { clearActionTableTestData, seedActionTableTestData } from '../actions-table-wrapper/actions-table-test-data';

describe('Dashboard', () => {
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    localStorage.removeItem('chart-library-feature');
    seedActionTableTestData();
    await TestBed.configureTestingModule({ imports: [Dashboard], providers: [provideRouter([])] }).compileComponents();
    fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    localStorage.removeItem('chart-library-feature');
    localStorage.removeItem('dashboard-feature');
    clearActionTableTestData();
  });

  it('renders the actions overview and summary charts', () => {
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Actions dashboard');
    expect(fixture.nativeElement.querySelector('main')?.textContent).toContain(
      'Overview of priorities and upcoming due dates',
    );
    expect(fixture.nativeElement.querySelector('#priority-chart')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('#due-date-chart')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-label="View high priority actions"]')?.getAttribute('href'))
      .toContain('/landing?priority=High');
    expect(fixture.nativeElement.querySelector('[aria-label="View medium priority actions"]')?.getAttribute('href'))
      .toContain('/landing?priority=Medium');
    expect(fixture.nativeElement.querySelector('[aria-label="View low priority actions"]')?.getAttribute('href'))
      .toContain('/landing?priority=Low');
    expect(fixture.nativeElement.querySelector('[aria-label="View actions with no priority"]')?.getAttribute('href'))
      .toContain('/landing?priority=none');
    expect(fixture.nativeElement.querySelector('#priority-chart-description')?.textContent)
      .toContain('Actions by priority:');
    expect(fixture.nativeElement.querySelector('#due-date-chart-description')?.textContent)
      .toContain('Actions due by month:');
    expect(fixture.nativeElement.querySelector('[aria-label="View all actions"]')?.getAttribute('href'))
      .toBe('/landing?highlightActions=true');
  });

  it('shows an actionable empty state when no action data is available', () => {
    TestBed.inject(AgTableStateService).setRowData([]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.dashboard__empty-state')?.textContent)
      .toContain('Priority and due date charts will appear when actions are available.');
    expect(fixture.nativeElement.querySelector('.dashboard__empty-state a')?.getAttribute('href'))
      .toBe('/landing');
  });

  it('renders both charts with Chart.js when that library is selected', async () => {
    await waitForChartRender();

    const priorityChart = fixture.nativeElement.querySelector('#priority-chart') as HTMLElement;
    const dueDateChart = fixture.nativeElement.querySelector('#due-date-chart') as HTMLElement;
    expect(priorityChart.querySelector('canvas')).not.toBeNull();
    expect(dueDateChart.querySelector('canvas')).not.toBeNull();
    expect(priorityChart.querySelector('svg')).toBeNull();
    expect(dueDateChart.querySelector('svg')).toBeNull();
  });

  it('navigates to the matching priority filter when a Chart.js pie slice is clicked', async () => {
    await waitForChartRender();
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    const chart = (fixture.componentInstance as unknown as {
      charts: { options: { onClick?: (event: never, elements: { index: number }[]) => void } }[];
    }).charts[0];

    chart.options.onClick?.(undefined as never, [{ index: 3 }]);

    expect(navigate).toHaveBeenCalledOnceWith(['/landing'], { queryParams: { priority: 'none' } });
  });

  it('renders both charts with Highcharts when that library is selected', async () => {
    TestBed.inject(FeatureToggleService).setChartLibrary('highcharts', true);
    fixture.detectChanges();
    await waitForChartRender();

    const priorityChart = fixture.nativeElement.querySelector('#priority-chart') as HTMLElement;
    const dueDateChart = fixture.nativeElement.querySelector('#due-date-chart') as HTMLElement;
    expect(priorityChart.querySelector('svg')).not.toBeNull();
    expect(dueDateChart.querySelector('svg')).not.toBeNull();
    expect(priorityChart.querySelector('canvas')).toBeNull();
    expect(dueDateChart.querySelector('canvas')).toBeNull();
  });

  it('navigates to the matching priority filter when a Highcharts pie slice is clicked', async () => {
    TestBed.inject(FeatureToggleService).setChartLibrary('highcharts', true);
    fixture.detectChanges();
    await waitForChartRender();
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    const charts = (fixture.componentInstance as unknown as {
      highchartsInstances: { series: { data: { firePointEvent: (event: string) => void }[] }[] }[];
    }).highchartsInstances;

    charts[0].series[0].data[0].firePointEvent('click');

    expect(navigate).toHaveBeenCalledOnceWith(['/landing'], { queryParams: { priority: 'High' } });
  });

  it('orders due-date chart buckets chronologically across year boundaries', () => {
    const state = TestBed.inject(AgTableStateService);
    const rows: ActionTableRow[] = [
      { id: 1, entityName: 'January', entityId: 'jan', dueDate: '2025-01-15' },
      { id: 2, entityName: 'December', entityId: 'dec', dueDate: '2024-12-15' },
      { id: 3, entityName: 'February', entityId: 'feb', dueDate: '2025-02-15' },
    ];
    state.setRowData(rows);

    expect(fixture.componentInstance.dueDateData().map(([month]) => month)).toEqual([
      'Dec 2024',
      'Jan 2025',
      'Feb 2025',
    ]);
  });
});

describe('Dashboard route', () => {
  beforeEach(() => {
    localStorage.setItem('dashboard-feature', 'false');
  });

  afterEach(() => {
    localStorage.removeItem('dashboard-feature');
  });

  it('redirects to the landing page when the dashboard is disabled', async () => {
    await TestBed.configureTestingModule({ providers: [provideRouter(routes)] }).compileComponents();

    const router = TestBed.inject(Router);
    await router.navigateByUrl('/dashboard');

    expect(router.url).toBe('/landing');
  });
});

function waitForChartRender(): Promise<void> {
  return new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
}
