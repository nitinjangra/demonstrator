import { Injectable, computed, signal } from '@angular/core';

export type TableFeature = 'ag-grid' | 'material-table';
export type ChartLibrary = 'chartjs' | 'highcharts';

const TABLE_FEATURE_KEY = 'table-feature';
const DASHBOARD_FEATURE_KEY = 'dashboard-feature';
const CHART_LIBRARY_KEY = 'chart-library-feature';

@Injectable({ providedIn: 'root' })
export class FeatureToggleService {
  private readonly selectedTable = signal<TableFeature>(this.readTableFeature());
  private readonly dashboardEnabledSignal = signal(
    localStorage.getItem(DASHBOARD_FEATURE_KEY) !== 'false',
  );
  private readonly chartLibrarySignal = signal<ChartLibrary>(this.readChartLibrary());

  readonly agGridEnabled = computed(() => this.selectedTable() === 'ag-grid');
  readonly materialTableEnabled = computed(() => this.selectedTable() === 'material-table');
  readonly dashboardEnabled = this.dashboardEnabledSignal.asReadonly();
  readonly chartJsEnabled = computed(() => this.chartLibrarySignal() === 'chartjs');
  readonly highchartsEnabled = computed(() => this.chartLibrarySignal() === 'highcharts');
  readonly chartLibrary = this.chartLibrarySignal.asReadonly();

  setTableFeature(feature: TableFeature, enabled: boolean): void {
    const current = this.selectedTable();
    const selected = enabled
      ? feature
      : current === feature
        ? feature === 'ag-grid'
          ? 'material-table'
          : 'ag-grid'
        : current;
    this.selectedTable.set(selected);
    localStorage.setItem(TABLE_FEATURE_KEY, selected);
  }

  setDashboardEnabled(enabled: boolean): void {
    this.dashboardEnabledSignal.set(enabled);
    localStorage.setItem(DASHBOARD_FEATURE_KEY, String(enabled));
  }

  setChartLibrary(library: ChartLibrary, enabled: boolean): void {
    const selected = enabled
      ? library
      : this.chartLibrarySignal() === library
        ? library === 'chartjs'
          ? 'highcharts'
          : 'chartjs'
        : this.chartLibrarySignal();
    this.chartLibrarySignal.set(selected);
    localStorage.setItem(CHART_LIBRARY_KEY, selected);
  }

  private readChartLibrary(): ChartLibrary {
    return localStorage.getItem(CHART_LIBRARY_KEY) === 'highcharts' ? 'highcharts' : 'chartjs';
  }

  private readTableFeature(): TableFeature {
    const stored = localStorage.getItem(TABLE_FEATURE_KEY);
    return stored === 'material-table' ? stored : 'ag-grid';
  }
}
