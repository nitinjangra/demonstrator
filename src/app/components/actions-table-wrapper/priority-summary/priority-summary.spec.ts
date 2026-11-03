import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Priority } from '../../../shared/enums/priority.enum';
import { mockTableData } from '../shared/mock/actions-table.mock';
import { PrioritySummaryComponent } from './priority-summary';

describe('PrioritySummaryComponent', () => {
  let fixture: ComponentFixture<PrioritySummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [PrioritySummaryComponent] }).compileComponents();
    fixture = TestBed.createComponent(PrioritySummaryComponent);
    fixture.componentRef.setInput('rowData', mockTableData);
    fixture.detectChanges();
  });

  it('shows total counts for every priority including unassigned rows', () => {
    const summary = fixture.nativeElement.textContent as string;

    expect(summary).toContain('20 actions');
    expect(summary).toContain('6 High');
    expect(summary).toContain('6 Medium');
    expect(summary).toContain('6 Low');
    expect(summary).toContain('2 No priority');
  });

  it('emits a selected priority and exposes a separate clear control', () => {
    let selectedPriority: Priority | 'none' | undefined;
    let wasCleared = false;
    fixture.componentInstance.prioritySelected.subscribe((priority) => {
      selectedPriority = priority;
    });
    fixture.componentInstance.filterCleared.subscribe(() => {
      wasCleared = true;
    });

    const highFilter = fixture.nativeElement.querySelector(
      '.priority-filter--high .priority-count',
    ) as HTMLButtonElement;
    highFilter.click();

    expect(selectedPriority).toBe(Priority.High);

    fixture.componentRef.setInput('selectedPriority', Priority.High);
    fixture.detectChanges();
    const clearButton = fixture.nativeElement.querySelector(
      '.priority-filter--high .priority-filter-clear',
    ) as HTMLButtonElement;
    clearButton.click();

    expect(wasCleared).toBeTrue();
  });

  it('highlights the priority applied from the dashboard route', () => {
    fixture.componentRef.setInput('selectedPriority', Priority.Medium);
    fixture.componentRef.setInput('routeAppliedPriority', Priority.Medium);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.priority-filter--medium')?.classList)
      .toContain('is-route-highlight');
    expect(fixture.nativeElement.querySelector('.priority-filter--high')?.classList)
      .not.toContain('is-route-highlight');
  });
});
