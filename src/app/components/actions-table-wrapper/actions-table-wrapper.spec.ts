import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionsTableWrapper } from './actions-table-wrapper';

describe('ActionsTableWrapper', () => {
  let component: ActionsTableWrapper;
  let fixture: ComponentFixture<ActionsTableWrapper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActionsTableWrapper],
    }).compileComponents();

    fixture = TestBed.createComponent(ActionsTableWrapper);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should render the actions table', () => {
    fixture.detectChanges();

    expect(component).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-actions-table')).not.toBeNull();
  });
});
