import { Component, computed, DestroyRef, ElementRef, inject, signal } from '@angular/core';
import { ThemeService } from '../services/theme.service';

const HOLD_DURATION_MS = 2000;

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss'],
})
export class ThemeToggleComponent {
  private readonly themeService = inject(ThemeService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private holdTimer: ReturnType<typeof setTimeout> | undefined;
  private keyboardClickResetTimer: ReturnType<typeof setTimeout> | undefined;
  private ignoreNextKeyboardClick = false;

  readonly isDarkMode = computed(() => this.themeService.theme() === 'dark');
  readonly isHolding = signal(false);
  readonly label = computed(() =>
    this.isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode',
  );

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.cancelHold();
      if (this.keyboardClickResetTimer !== undefined) {
        clearTimeout(this.keyboardClickResetTimer);
      }
    });
  }

  onClick(event: MouseEvent): void {
    if (event.detail > 0) {
      return;
    }

    if (this.ignoreNextKeyboardClick) {
      this.ignoreNextKeyboardClick = false;
      return;
    }

    this.toggleTheme();
  }

  onPointerDown(event: PointerEvent): void {
    if (!event.isPrimary || event.button !== 0) {
      return;
    }

    this.startHold();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key !== ' ' && event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    if (!event.repeat) {
      this.startHold();
    }
  }

  onKeyUp(event: KeyboardEvent): void {
    if (event.key !== ' ' && event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    this.cancelHold();
    this.ignoreNextKeyboardClick = true;
    this.keyboardClickResetTimer = setTimeout(() => {
      this.ignoreNextKeyboardClick = false;
      this.keyboardClickResetTimer = undefined;
    });
  }

  cancelHold(): void {
    if (this.holdTimer !== undefined) {
      clearTimeout(this.holdTimer);
      this.holdTimer = undefined;
    }
    this.isHolding.set(false);
  }

  toggleTheme() {
    const button = (this.elementRef.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      'button',
    );
    if (
      !button ||
      !document.startViewTransition ||
      matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      this.themeService.toggleTheme();
      return;
    }

    const bounds = button.getBoundingClientRect();
    const centerX = bounds.left + bounds.width / 2;
    const centerY = bounds.top + bounds.height / 2;
    const radius = Math.hypot(
      Math.max(centerX, window.innerWidth - centerX),
      Math.max(centerY, window.innerHeight - centerY),
    );
    const root = document.documentElement;

    root.style.setProperty('--theme-reveal-x', `${centerX}px`);
    root.style.setProperty('--theme-reveal-y', `${centerY}px`);
    root.style.setProperty('--theme-reveal-radius', `${radius}px`);

    const transition = document.startViewTransition(() => this.themeService.toggleTheme());
    void transition.finished.then(
      () => this.clearRevealOrigin(root),
      () => this.clearRevealOrigin(root),
    );
  }

  private clearRevealOrigin(root: HTMLElement): void {
    root.style.removeProperty('--theme-reveal-x');
    root.style.removeProperty('--theme-reveal-y');
    root.style.removeProperty('--theme-reveal-radius');
  }

  private startHold(): void {
    if (this.isHolding()) {
      return;
    }

    this.isHolding.set(true);
    this.holdTimer = setTimeout(() => {
      this.holdTimer = undefined;
      if (!this.isHolding()) {
        return;
      }
      this.isHolding.set(false);
      this.toggleTheme();
    }, HOLD_DURATION_MS);
  }
}
