import { Component, inject } from '@angular/core';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  template: `
    <button mat-button (click)="toggleTheme()">
      Switch to {{ themeService.getTheme() === 'light' ? 'Dark' : 'Light' }} Mode
    </button>
  `,
})
export class ThemeToggleComponent {
  themeService = inject(ThemeService);
  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
