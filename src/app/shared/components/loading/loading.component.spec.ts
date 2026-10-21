import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoadingComponent } from './loading.component';

describe('LoadingComponent', () => {
  let fixture: ComponentFixture<LoadingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [LoadingComponent] }).compileComponents();
    fixture = TestBed.createComponent(LoadingComponent);
    fixture.detectChanges();
  });

  it('announces the default loading status accessibly', () => {
    const status = fixture.nativeElement.querySelector('[role="status"]') as HTMLElement;

    expect(status.getAttribute('aria-label')).toBe('Loading');
    expect(status.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it('shows the provided loading text and uses it as the label', () => {
    fixture.componentRef.setInput('text', 'Loading announcements');
    fixture.detectChanges();

    const status = fixture.nativeElement.querySelector('[role="status"]') as HTMLElement;
    expect(status.getAttribute('aria-label')).toBe('Loading announcements');
    expect(status.textContent).toContain('Loading announcements');
  });
});
