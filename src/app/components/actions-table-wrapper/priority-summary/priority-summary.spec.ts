import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Priority } from '../../../shared/enums/priority.enum';
import { actionRowsForTests } from '../actions-table-test-data';
import { PrioritySummaryComponent } from './priority-summary';

describe('PrioritySummaryComponent', () => {
  let fixture: ComponentFixture<PrioritySummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PrioritySummaryComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(PrioritySummaryComponent);
    fixture.componentRef.setInput('rowData', actionRowsForTests);
    fixture.detectChanges();
  });

  it('shows total counts for every priority including unassigned rows', () => {
    const summary = fixture.nativeElement.textContent as string;

    expect(summary).toContain('20 actions');
    for (const [className, count, label] of [
      ['high', '6', 'High'],
      ['medium', '6', 'Medium'],
      ['low', '6', 'Low'],
      ['none', '2', 'No priority'],
    ]) {
      const button = fixture.nativeElement.querySelector(
        `.priority-filter--${className} .priority-count`,
      ) as HTMLButtonElement;
      expect(button.querySelector('.priority-count-number')?.textContent).toBe(count);
      expect(button.querySelector('.priority-count-label span:last-child')?.textContent).toBe(
        label,
      );
    }
  });

  it('places each count before the priority icon and label', () => {
    const highBadge = fixture.nativeElement.querySelector(
      '.priority-filter--high .priority-count',
    ) as HTMLButtonElement;
    const count = highBadge.querySelector('.priority-count-number');
    const label = highBadge.querySelector('.priority-count-label');

    expect(count).not.toBeNull();
    expect(label).not.toBeNull();
    expect(highBadge.children[0]).toBe(count as Element);
    expect(highBadge.children[1]).toBe(label as Element);
    expect(label?.querySelector('mat-icon')).not.toBeNull();
    expect(label?.textContent).toContain('High');
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

    expect(fixture.nativeElement.querySelector('.priority-filter--medium')?.classList).toContain(
      'is-route-highlight',
    );
    expect(fixture.nativeElement.querySelector('.priority-filter--high')?.classList).not.toContain(
      'is-route-highlight',
    );
  });
});
