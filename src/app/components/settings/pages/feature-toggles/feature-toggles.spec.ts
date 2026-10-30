import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { FeatureToggleService } from '../../../../shared/services/feature-toggle.service';
import { FeatureToggles } from './feature-toggles';

describe('FeatureToggles', () => {
  let fixture: ComponentFixture<FeatureToggles>;
  let featuresSpy: jasmine.SpyObj<FeatureToggleService>;

  beforeEach(async () => {
    featuresSpy = jasmine.createSpyObj<FeatureToggleService>(
      'FeatureToggleService',
      ['setTableFeature', 'setDashboardEnabled', 'setChartLibrary'],
      {
        agGridEnabled: signal(true),
        materialTableEnabled: signal(false),
        dashboardEnabled: signal(true),
        chartJsEnabled: signal(true),
        highchartsEnabled: signal(false),
      },
    );

    await TestBed.configureTestingModule({
      imports: [FeatureToggles],
      providers: [{ provide: FeatureToggleService, useValue: featuresSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureToggles);
    fixture.detectChanges();
  });

  it('renders the table and dashboard feature choices', () => {
    expect(fixture.nativeElement.textContent).toContain('AG Grid');
    expect(fixture.nativeElement.textContent).toContain('Material table');
    expect(fixture.nativeElement.textContent).toContain('Enable dashboard');
    expect(fixture.nativeElement.textContent).toContain('Chart.js');
    expect(fixture.nativeElement.textContent).toContain('Highcharts');
  });

  it('delegates table and dashboard updates to the feature service', () => {
    fixture.componentInstance.setTableFeature('material-table', true);
    fixture.componentInstance.setDashboardEnabled(false);
    fixture.componentInstance.setChartLibrary('highcharts', true);

    expect(featuresSpy.setTableFeature).toHaveBeenCalledWith('material-table', true);
    expect(featuresSpy.setDashboardEnabled).toHaveBeenCalledWith(false);
    expect(featuresSpy.setChartLibrary).toHaveBeenCalledWith('highcharts', true);
  });
});
