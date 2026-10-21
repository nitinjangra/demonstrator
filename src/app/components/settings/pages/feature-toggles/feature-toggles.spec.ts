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
      ['setTableFeature', 'setDashboardEnabled'],
      {
        agGridEnabled: signal(true),
        materialTableEnabled: signal(false),
        dashboardEnabled: signal(true),
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
  });

  it('delegates table and dashboard updates to the feature service', () => {
    fixture.componentInstance.setTableFeature('material-table', true);
    fixture.componentInstance.setDashboardEnabled(false);

    expect(featuresSpy.setTableFeature).toHaveBeenCalledWith('material-table', true);
    expect(featuresSpy.setDashboardEnabled).toHaveBeenCalledWith(false);
  });
});
