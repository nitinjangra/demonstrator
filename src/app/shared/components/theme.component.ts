import { Component, computed, ElementRef, inject } from '@angular/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  imports: [MatTooltipModule],
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss'],
})
export class ThemeToggleComponent {
  private readonly themeService = inject(ThemeService);
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  readonly isDarkMode = computed(() => this.themeService.theme() === 'dark');
  readonly label = computed(() =>
    this.isDarkMode() ? 'Switch to light mode' : 'Switch to dark mode',
  );

  toggleTheme(): void {
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
}
