import { Component, signal } from '@angular/core';
import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { HoldFeedbackDirective } from './hold-feedback.directive';

@Component({
  standalone: true,
  imports: [HoldFeedbackDirective],
  template: `<button
    appHoldFeedback
    [holdFeedbackDuration]="duration()"
    (holdFeedbackComplete)="onComplete()"
  >
    Hold
  </button>`,
})
class HostComponent {
  duration = signal<number | undefined>(100);
  complete = 0;

  onComplete(): void {
    this.complete += 1;
  }
}

describe('HoldFeedbackDirective', () => {
  let fixture: ReturnType<typeof TestBed.createComponent<HostComponent>>;
  let button: HTMLButtonElement;
  let directive: HoldFeedbackDirective;

  beforeEach(() => {
    fixture = TestBed.createComponent(HostComponent);
    button = fixture.nativeElement.querySelector('button');
    fixture.detectChanges();
    directive = fixture.debugElement.children[0].injector.get(HoldFeedbackDirective);
  });

  it('uses the default and configured animation durations', () => {
    fixture.componentInstance.duration.set(undefined);
    fixture.detectChanges();
    expect(button.style.getPropertyValue('--hold-feedback-duration')).toBe('2000ms');

    fixture.componentInstance.duration.set(250);
    fixture.detectChanges();
    expect(button.style.getPropertyValue('--hold-feedback-duration')).toBe('250ms');
  });

  it('starts only primary left-button pointer holds and completes after duration', fakeAsync(() => {
    button.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, isPrimary: false, button: 0 }),
    );
    expect(button.classList).not.toContain('hold-feedback--active');
    button.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, isPrimary: true, button: 1 }),
    );
    expect(button.classList).not.toContain('hold-feedback--active');

    button.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, isPrimary: true, button: 0 }),
    );
    fixture.detectChanges();
    expect(directive.isHolding).toBeTrue();
    tick(100);
    expect(fixture.componentInstance.complete).toBe(1);
    fixture.detectChanges();
    expect(button.classList).not.toContain('hold-feedback--active');
  }));

  it('cancels pointer holds on release, leave, cancel, and blur', fakeAsync(() => {
    const cancelEvents = ['pointerup', 'pointerleave', 'pointercancel', 'blur'];
    for (const eventName of cancelEvents) {
      button.dispatchEvent(
        new PointerEvent('pointerdown', { bubbles: true, isPrimary: true, button: 0 }),
      );
      const event =
        eventName === 'blur'
          ? new Event(eventName)
          : new PointerEvent(eventName, { bubbles: true });
      button.dispatchEvent(event);
      tick(100);
    }
    expect(fixture.componentInstance.complete).toBe(0);
    expect(button.classList).not.toContain('hold-feedback--active');
  }));

  it('supports Space and Enter, ignores repeats and unrelated keys, and cancels on keyup', fakeAsync(() => {
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'x', bubbles: true }));
    button.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', repeat: true, bubbles: true }),
    );
    expect(button.classList).not.toContain('hold-feedback--active');

    button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(directive.isHolding).toBeTrue();
    button.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', bubbles: true }));
    tick(100);
    expect(fixture.componentInstance.complete).toBe(0);

    button.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    tick(100);
    expect(fixture.componentInstance.complete).toBe(1);
    button.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }));
  }));

  it('holds without a timer when no duration is configured and clamps negative durations', fakeAsync(() => {
    fixture.componentInstance.duration.set(undefined);
    fixture.detectChanges();
    button.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, isPrimary: true, button: 0 }),
    );
    fixture.detectChanges();
    tick(3000);
    expect(directive.isHolding).toBeTrue();
    expect(fixture.componentInstance.complete).toBe(0);

    button.dispatchEvent(new PointerEvent('pointerup', { bubbles: true }));
    fixture.componentInstance.duration.set(-1);
    fixture.detectChanges();
    button.dispatchEvent(
      new PointerEvent('pointerdown', { bubbles: true, isPrimary: true, button: 0 }),
    );
    tick(0);
    expect(fixture.componentInstance.complete).toBe(1);
  }));

  it('cancels a pending hold when its host is destroyed', fakeAsync(() => {
    button.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true, button: 0 }));
    fixture.destroy();
    tick(100);
    expect(fixture.componentInstance.complete).toBe(0);
  }));
});
