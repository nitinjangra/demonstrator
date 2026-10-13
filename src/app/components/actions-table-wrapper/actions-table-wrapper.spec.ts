import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FeatureToggleService } from '../../shared/services/feature-toggle.service';

import { ActionsTableWrapper } from './actions-table-wrapper';

describe('ActionsTableWrapper', () => {
  let component: ActionsTableWrapper;
  let fixture: ComponentFixture<ActionsTableWrapper>;
  let features: FeatureToggleService;

  beforeEach(async () => {
    localStorage.removeItem('table-feature');
    await TestBed.configureTestingModule({
      imports: [ActionsTableWrapper],
    }).compileComponents();

    fixture = TestBed.createComponent(ActionsTableWrapper);
    component = fixture.componentInstance;
    features = TestBed.inject(FeatureToggleService);
    await fixture.whenStable();
  });

  afterEach(() => localStorage.removeItem('table-feature'));

  it('should render AG Grid by default', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-ag-grid-table')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('ag-grid-angular')).not.toBeNull();
  });

  it('should render Material table when that implementation is selected', () => {
    features.setTableFeature('material-table', true);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-ag-grid-table')).toBeNull();
    expect(fixture.nativeElement.querySelector('app-material-table')).not.toBeNull();
  });

  it('should keep a table selected when the active implementation is switched off', () => {
    features.setTableFeature('ag-grid', false);
    fixture.detectChanges();

    expect(features.agGridEnabled()).toBeFalse();
    expect(features.materialTableEnabled()).toBeTrue();
    expect(fixture.nativeElement.querySelector('app-material-table')).not.toBeNull();
  });
});
