import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { FeatureToggleService } from '../../shared/services/feature-toggle.service';
import { routes } from '../../app.routes';
import { Dashboard } from './dashboard';

describe('Dashboard', () => {
  let fixture: ComponentFixture<Dashboard>;

  beforeEach(async () => {
    localStorage.removeItem('chart-library-feature');
    await TestBed.configureTestingModule({ imports: [Dashboard] }).compileComponents();
    fixture = TestBed.createComponent(Dashboard);
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
    localStorage.removeItem('chart-library-feature');
    localStorage.removeItem('dashboard-feature');
  });

  it('renders the actions overview and summary charts', () => {
    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Actions dashboard');
    expect(fixture.nativeElement.querySelector('main')?.textContent).toContain(
      'Overview of priorities and upcoming due dates.',
    );
    expect(fixture.nativeElement.querySelector('#priority-chart')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('#due-date-chart')).not.toBeNull();
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
