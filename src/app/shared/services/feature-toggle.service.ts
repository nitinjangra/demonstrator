import { Injectable, computed, signal } from '@angular/core';

export type TableFeature = 'ag-grid' | 'material-table';

const TABLE_FEATURE_KEY = 'table-feature';
const DASHBOARD_FEATURE_KEY = 'dashboard-feature';

@Injectable({ providedIn: 'root' })
export class FeatureToggleService {
  private readonly selectedTable = signal<TableFeature>(this.readTableFeature());
  private readonly dashboardEnabledSignal = signal(
    localStorage.getItem(DASHBOARD_FEATURE_KEY) !== 'false',
  );

  readonly agGridEnabled = computed(() => this.selectedTable() === 'ag-grid');
  readonly materialTableEnabled = computed(() => this.selectedTable() === 'material-table');
  readonly dashboardEnabled = this.dashboardEnabledSignal.asReadonly();

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

  private readTableFeature(): TableFeature {
    const stored = localStorage.getItem(TABLE_FEATURE_KEY);
    return stored === 'material-table' ? stored : 'ag-grid';
  }
}
