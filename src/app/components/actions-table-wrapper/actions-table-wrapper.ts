import { Component, inject } from '@angular/core';
import { AgGridTable } from './ag-grid-table/ag-grid-table';
import { FeatureToggleService } from '../../shared/services/feature-toggle.service';
import { MaterialTable } from './material-table/material-table';

@Component({
  selector: 'app-actions-table-wrapper',
  standalone: true,
  imports: [AgGridTable, MaterialTable],
  templateUrl: './actions-table-wrapper.html',
  styleUrl: './actions-table-wrapper.scss',
})
export class ActionsTableWrapper {
  private readonly features = inject(FeatureToggleService);
  readonly agGridEnabled = this.features.agGridEnabled;
  readonly materialTableEnabled = this.features.materialTableEnabled;
}
