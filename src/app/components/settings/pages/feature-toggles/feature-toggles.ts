import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { StickyFooterComponent } from '../../../../shared/components/sticky-footer/sticky-footer.component';
import { UnsavedChangesDialogService } from '../../../../shared/components/unsaved-changes-dialog/unsaved-changes-dialog.component';
import {
  ChartLibrary,
  FeatureToggleService,
  TableFeature,
} from '../../../../shared/services/feature-toggle.service';

@Component({
  selector: 'app-feature-toggles',
  standalone: true,
  imports: [MatButtonModule, MatSlideToggleModule, StickyFooterComponent],
  templateUrl: './feature-toggles.html',
  styleUrl: './feature-toggles.scss',
})
export class FeatureToggles {
  private readonly features = inject(FeatureToggleService);
  private readonly unsavedChangesDialog = inject(UnsavedChangesDialogService);
  readonly agGridEnabled = this.features.agGridEnabled;
  readonly dashboardEnabled = this.features.dashboardEnabled;
  readonly mockDriverEnabled = this.features.mockDriverEnabled;
  readonly chartJsEnabled = this.features.chartJsEnabled;
  readonly draftTableFeature = signal<TableFeature>(
    this.agGridEnabled() ? 'ag-grid' : 'material-table',
  );
  readonly draftDashboardEnabled = signal(this.dashboardEnabled());
  readonly draftMockDriverEnabled = signal(this.mockDriverEnabled());
  readonly draftChartLibrary = signal<ChartLibrary>(
    this.chartJsEnabled() ? 'chartjs' : 'highcharts',
  );
  readonly hasUnsavedChanges = computed(
    () =>
      this.draftTableFeature() !== (this.agGridEnabled() ? 'ag-grid' : 'material-table') ||
      this.draftDashboardEnabled() !== this.dashboardEnabled() ||
      this.draftMockDriverEnabled() !== this.mockDriverEnabled() ||
      this.draftChartLibrary() !== (this.chartJsEnabled() ? 'chartjs' : 'highcharts'),
  );

  setTableFeature(feature: 'ag-grid' | 'material-table', enabled: boolean): void {
    if (enabled) this.draftTableFeature.set(feature);
  }

  setDashboardEnabled(enabled: boolean): void {
    this.draftDashboardEnabled.set(enabled);
  }

  setMockDriverEnabled(enabled: boolean): void {
    this.draftMockDriverEnabled.set(enabled);
  }

  setChartLibrary(library: 'chartjs' | 'highcharts', enabled: boolean): void {
    if (enabled) this.draftChartLibrary.set(library);
  }

  saveChanges(): void {
    this.features.setTableFeature(this.draftTableFeature(), true);
    this.features.setDashboardEnabled(this.draftDashboardEnabled());
    this.features.setMockDriverEnabled(this.draftMockDriverEnabled());
    this.features.setChartLibrary(this.draftChartLibrary(), true);
  }

  @HostListener('window:beforeunload', ['$event'])
  warnBeforeLeaving(event: BeforeUnloadEvent): void {
    this.unsavedChangesDialog.warnBeforeUnload(event, this.hasUnsavedChanges());
  }

  canDeactivate(): boolean | import('rxjs').Observable<boolean> {
    return this.unsavedChangesDialog.confirmIfNeeded(this.hasUnsavedChanges());
  }
}
