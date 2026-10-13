import { TestBed } from '@angular/core/testing';
import { FeatureToggleService } from './feature-toggle.service';

describe('FeatureToggleService', () => {
  let service: FeatureToggleService;

  beforeEach(() => {
    localStorage.removeItem('table-feature');
    localStorage.removeItem('dashboard-feature');
    TestBed.configureTestingModule({ providers: [FeatureToggleService] });
    service = TestBed.inject(FeatureToggleService);
  });

  afterEach(() => {
    localStorage.removeItem('table-feature');
    localStorage.removeItem('dashboard-feature');
  });

  it('defaults to AG Grid to preserve the existing table choice', () => {
    expect(service.agGridEnabled()).toBeTrue();
    expect(service.materialTableEnabled()).toBeFalse();
  });

  it('switches to the other table when the selected table is turned off', () => {
    service.setTableFeature('ag-grid', false);

    expect(service.agGridEnabled()).toBeFalse();
    expect(service.materialTableEnabled()).toBeTrue();
    expect(localStorage.getItem('table-feature')).toBe('material-table');
  });

  it('selects only the newly enabled table', () => {
    service.setTableFeature('material-table', true);

    expect(service.agGridEnabled()).toBeFalse();
    expect(service.materialTableEnabled()).toBeTrue();
  });

  it('persists the dashboard toggle', () => {
    service.setDashboardEnabled(false);

    expect(service.dashboardEnabled()).toBeFalse();
    expect(localStorage.getItem('dashboard-feature')).toBe('false');
  });
});
