import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { StickyFooterComponent } from '../../../../shared/components/sticky-footer/sticky-footer.component';
import { ThemePreference, ThemeService } from '../../../../shared/services/theme.service';

@Component({
  selector: 'app-theme-setting',
  standalone: true,
  imports: [MatButtonModule, MatButtonToggleModule, StickyFooterComponent],
  templateUrl: './theme-setting.html',
  styleUrl: './theme-setting.scss',
})
export class ThemeSetting {
  private readonly themeService = inject(ThemeService);
  readonly theme = this.themeService.theme;
  readonly preference = this.themeService.preference;
  readonly draftPreference = signal(this.preference());
  readonly hasUnsavedChanges = computed(() => this.draftPreference() !== this.preference());

  setTheme(theme: ThemePreference): void {
    this.draftPreference.set(theme);
  }

  saveChanges(): void {
    this.themeService.setTheme(this.draftPreference());
  }
}
