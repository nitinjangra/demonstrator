import { Component, inject } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FeatureToggleService } from '../../../../shared/services/feature-toggle.service';

@Component({
  selector: 'app-feature-toggles',
  standalone: true,
  imports: [MatSlideToggleModule],
  templateUrl: './feature-toggles.html',
  styleUrl: './feature-toggles.scss',
})
export class FeatureToggles {
  private readonly features = inject(FeatureToggleService);
  readonly agGridEnabled = this.features.agGridEnabled;
  readonly materialTableEnabled = this.features.materialTableEnabled;
  readonly dashboardEnabled = this.features.dashboardEnabled;

  setTableFeature(feature: 'ag-grid' | 'material-table', enabled: boolean): void {
    this.features.setTableFeature(feature, enabled);
  }

  setDashboardEnabled(enabled: boolean): void {
    this.features.setDashboardEnabled(enabled);
  }
}
