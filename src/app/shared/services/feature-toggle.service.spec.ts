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

  it('restores the material table selection from storage', () => {
    localStorage.setItem('table-feature', 'material-table');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [FeatureToggleService] });
    service = TestBed.inject(FeatureToggleService);

    expect(service.materialTableEnabled()).toBeTrue();
    expect(service.agGridEnabled()).toBeFalse();
  });

  it('falls back to AG Grid for an unknown stored table selection', () => {
    localStorage.setItem('table-feature', 'unknown');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [FeatureToggleService] });
    service = TestBed.inject(FeatureToggleService);

    expect(service.agGridEnabled()).toBeTrue();
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

  it('keeps the current table when another table is turned off', () => {
    service.setTableFeature('material-table', false);

    expect(service.agGridEnabled()).toBeTrue();
    expect(service.materialTableEnabled()).toBeFalse();
  });

  it('switches to AG Grid when the material table is turned off', () => {
    service.setTableFeature('material-table', true);
    service.setTableFeature('material-table', false);

    expect(service.agGridEnabled()).toBeTrue();
    expect(localStorage.getItem('table-feature')).toBe('ag-grid');
  });

  it('persists the dashboard toggle', () => {
    service.setDashboardEnabled(false);

    expect(service.dashboardEnabled()).toBeFalse();
    expect(localStorage.getItem('dashboard-feature')).toBe('false');
  });

  it('restores a disabled dashboard setting from storage', () => {
    localStorage.setItem('dashboard-feature', 'false');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [FeatureToggleService] });
    service = TestBed.inject(FeatureToggleService);

    expect(service.dashboardEnabled()).toBeFalse();
  });
});
