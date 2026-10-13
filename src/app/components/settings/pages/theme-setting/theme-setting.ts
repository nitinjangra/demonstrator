import { Component, inject } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { ThemePreference, ThemeService } from '../../../../shared/services/theme.service';

@Component({
  selector: 'app-theme-setting',
  standalone: true,
  imports: [MatButtonToggleModule],
  templateUrl: './theme-setting.html',
  styleUrl: './theme-setting.scss',
})
export class ThemeSetting {
  private readonly themeService = inject(ThemeService);
  readonly theme = this.themeService.theme;
  readonly preference = this.themeService.preference;

  setTheme(theme: ThemePreference): void {
    this.themeService.setTheme(theme);
  }
}
