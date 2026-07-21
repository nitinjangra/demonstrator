import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgActionsTable } from './ag-actions-table';

describe('AgActionsTable', () => {
  let component: AgActionsTable;
  let fixture: ComponentFixture<AgActionsTable>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgActionsTable],
    }).compileComponents();

    fixture = TestBed.createComponent(AgActionsTable);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
