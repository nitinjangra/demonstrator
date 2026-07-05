import { Component, computed, inject } from '@angular/core';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  standalone: true,
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss'],
})
export class ThemeToggleComponent {
  private readonly themeService = inject(ThemeService);

  readonly isDarkMode = computed(() => this.themeService.theme() === 'dark');
  readonly label = computed(() =>
    this.isDarkMode() ? 'Switch to Light Mode' : 'Switch to Dark Mode',
  );

  toggleTheme() {
    this.themeService.toggleTheme();
  }
}
