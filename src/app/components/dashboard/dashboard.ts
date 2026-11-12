import { isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { Chart, registerables } from 'chart.js';
import Highcharts from 'highcharts/es-modules/masters/highcharts.src.js';
import 'highcharts/es-modules/masters/modules/accessibility.src.js';
import { ActionTableRow } from '../../shared/interfaces/actions-table.interface';
import { Priority } from '../../shared/enums/priority.enum';
import { AgTableActionService } from '../actions-table-wrapper/shared/services/ag-table-action.service';
import { AgTableStateService } from '../actions-table-wrapper/shared/services/ag-table-state.service';
import { FeatureToggleService } from '../../shared/services/feature-toggle.service';
import { Router, RouterLink } from '@angular/router';
import { UserSettingsService } from '../../shared/services/user-settings.service';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements AfterViewInit {
  private readonly actionService = inject(AgTableActionService);
  private readonly state = inject(AgTableStateService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly features = inject(FeatureToggleService);
  private readonly router = inject(Router);
  readonly userName = inject(UserSettingsService).userName;
  private charts: Chart[] = [];
  private highchartsInstances: Highcharts.Chart[] = [];

  readonly rows = toSignal(this.state.getRowData(), { initialValue: [] as ActionTableRow[] });
  readonly library = this.features.chartLibrary;
  readonly totalActions = computed(() => this.rows().length);
  readonly priorityCounts = computed(() => [
    this.rows().filter((row) => row.priority === Priority.High).length,
    this.rows().filter((row) => row.priority === Priority.Medium).length,
    this.rows().filter((row) => row.priority === Priority.Low).length,
    this.rows().filter((row) => !row.priority).length,
  ]);
  readonly priorityChartSummary = computed(() => {
    const [high, medium, low, none] = this.priorityCounts();
    return `Actions by priority: ${high} High, ${medium} Medium, ${low} Low, ${none} with no priority.`;
  });
  readonly dueDateData = computed(() => {
    const counts = new Map<number, number>();
    for (const row of this.rows()) {
      const date = this.asDate(row.dueDate);
      if (date) {
        const monthKey = date.getFullYear() * 12 + date.getMonth();
        counts.set(monthKey, (counts.get(monthKey) ?? 0) + 1);
      }
    }
    return [...counts.entries()]
      .sort(([left], [right]) => left - right)
      .map(([monthKey, count]) => {
        const date = new Date(Math.floor(monthKey / 12), monthKey % 12, 1);
        return [date.toLocaleString('en', { month: 'short', year: 'numeric' }), count] as const;
      });
  });
  readonly dueDateChartSummary = computed(() => {
    const buckets = this.dueDateData();
    return buckets.length
      ? `Actions due by month: ${buckets.map(([month, count]) => `${month}: ${count}`).join('; ')}.`
      : 'No due date data is available.';
  });

  constructor() {
    this.actionService.loadGridData();
    this.state
      .getRowData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.renderCharts());
    effect(() => {
      this.library();
      this.renderCharts();
    });
    this.destroyRef.onDestroy(() => this.destroyCharts());
  }

  ngAfterViewInit(): void {
    this.renderCharts();
  }

  navigateToPriority(priority: Priority | 'none'): void {
    void this.router.navigate(['/landing'], { queryParams: { priority } });
  }

  private readonly chartPriorities: (Priority | 'none')[] = [
    Priority.High,
    Priority.Medium,
    Priority.Low,
    'none',
  ];

  private renderCharts(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    requestAnimationFrame(() => {
      if (!document.getElementById('priority-chart') || !document.getElementById('due-date-chart'))
        return;
      this.destroyCharts();
      if (this.features.chartJsEnabled()) this.renderChartJs();
      else this.renderHighcharts();
    });
  }

  private renderChartJs(): void {
    const colors = ['#d94d4d', '#e4a62a', '#39966a', '#9aa3ad'];
    const priority = document.getElementById('priority-chart') as HTMLDivElement;
    const due = document.getElementById('due-date-chart') as HTMLDivElement;
    this.charts.push(
      new Chart(this.createCanvas(priority, 'priority', 'priority-chart-description'), {
        type: 'doughnut',
        data: {
          labels: ['High', 'Medium', 'Low', 'No priority'],
          datasets: [{ data: this.priorityCounts(), backgroundColor: colors, borderWidth: 0 }],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: 'bottom' } },
          onClick: (_event, activeElements) => {
            const index = activeElements[0]?.index;
            const selected = index === undefined ? undefined : this.chartPriorities[index];
            if (selected) this.navigateToPriority(selected);
          },
        },
      }),
    );
    this.charts.push(
      new Chart(this.createCanvas(due, 'due-date', 'due-date-chart-description'), {
        type: 'bar',
        data: {
          labels: this.dueDateData().map(([month]) => month),
          datasets: [
            {
              label: 'Actions due',
              data: this.dueDateData().map(([, count]) => count),
              backgroundColor: '#5276d8',
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
        },
      }),
    );
  }

  private renderHighcharts(): void {
    const colors = ['#d94d4d', '#e4a62a', '#39966a', '#9aa3ad'];
    const navigateToPriority = (priority: Priority | 'none') => this.navigateToPriority(priority);
    this.highchartsInstances.push(
      Highcharts.chart('priority-chart', {
        chart: { type: 'pie', backgroundColor: 'transparent' },
        title: { text: undefined },
        accessibility: { enabled: true },
        credits: { enabled: false },
        plotOptions: {
          pie: {
            innerSize: '62%',
            showInLegend: true,
            cursor: 'pointer',
            point: {
              events: {
                click: function (this: Highcharts.Point) {
                  const selected = this.name === 'No priority' ? 'none' : (this.name as Priority);
                  navigateToPriority(selected);
                },
              },
            },
          },
        },
        series: [
          {
            type: 'pie',
            name: 'Actions',
            data: ['High', 'Medium', 'Low', 'No priority'].map((name, index) => ({
              name,
              y: this.priorityCounts()[index],
              color: colors[index],
            })),
          },
        ],
      }),
    );
    const due = this.dueDateData();
    this.highchartsInstances.push(
      Highcharts.chart('due-date-chart', {
        chart: { type: 'column', backgroundColor: 'transparent' },
        title: { text: undefined },
        accessibility: { enabled: true },
        credits: { enabled: false },
        xAxis: { categories: due.map(([month]) => month), crosshair: true },
        yAxis: { min: 0, title: { text: 'Actions due' }, allowDecimals: false },
        legend: { enabled: false },
        series: [
          {
            type: 'column',
            name: 'Actions due',
            color: '#5276d8',
            data: due.map(([, count]) => count),
          },
        ],
      }),
    );
  }

  private destroyCharts(): void {
    this.charts.forEach((chart) => chart.destroy());
    this.charts = [];
    this.highchartsInstances.forEach((chart) => chart.destroy());
    this.highchartsInstances = [];
    for (const id of ['priority-chart', 'due-date-chart']) {
      const container = document.getElementById(id);
      if (container) container.replaceChildren();
    }
  }

  private createCanvas(
    container: HTMLElement,
    name: string,
    descriptionId: string,
  ): HTMLCanvasElement {
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-label', `${name} chart`);
    canvas.setAttribute('aria-describedby', descriptionId);
    container.replaceChildren(canvas);
    return canvas;
  }

  private asDate(value: ActionTableRow['dueDate']): Date | null {
    if (!value) return null;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  }
}
