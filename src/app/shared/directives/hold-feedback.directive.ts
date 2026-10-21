import {
  DestroyRef,
  Directive,
  EventEmitter,
  HostBinding,
  HostListener,
  inject,
  Input,
  Output,
} from '@angular/core';

@Directive({
  selector: '[appHoldFeedback]',
  standalone: true,
})
export class HoldFeedbackDirective {
  private readonly destroyRef = inject(DestroyRef);
  private holdTimer: ReturnType<typeof setTimeout> | undefined;

  @Input() holdFeedbackDuration: number | undefined;
  @Output() readonly holdFeedbackComplete = new EventEmitter<void>();

  @HostBinding('class.hold-feedback--active') isHolding = false;
  @HostBinding('style.--hold-feedback-duration')
  get animationDuration(): string {
    return `${this.holdFeedbackDuration ?? 2000}ms`;
  }

  constructor() {
    this.destroyRef.onDestroy(() => this.cancelHold());
  }

  @HostListener('pointerdown', ['$event'])
  onPointerDown(event: PointerEvent): void {
    if (event.isPrimary && event.button === 0) {
      this.startHold();
    }
  }

  @HostListener('pointerup')
  onPointerUp(): void {
    this.cancelHold();
  }

  @HostListener('pointerleave')
  onPointerLeave(): void {
    this.cancelHold();
  }

  @HostListener('pointercancel')
  onPointerCancel(): void {
    this.cancelHold();
  }

  @HostListener('blur')
  onBlur(): void {
    this.cancelHold();
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) {
      this.startHold();
    }
  }

  @HostListener('keyup', ['$event'])
  onKeyUp(event: KeyboardEvent): void {
    if (event.key === ' ' || event.key === 'Enter') {
      this.cancelHold();
    }
  }

  private startHold(): void {
    if (this.isHolding) {
      return;
    }

    this.isHolding = true;
    if (this.holdFeedbackDuration === undefined) {
      return;
    }

    this.holdTimer = setTimeout(() => {
      this.holdTimer = undefined;
      this.isHolding = false;
      this.holdFeedbackComplete.emit();
    }, Math.max(0, this.holdFeedbackDuration));
  }

  private cancelHold(): void {
    if (this.holdTimer !== undefined) {
      clearTimeout(this.holdTimer);
      this.holdTimer = undefined;
    }
    this.isHolding = false;
  }
}
