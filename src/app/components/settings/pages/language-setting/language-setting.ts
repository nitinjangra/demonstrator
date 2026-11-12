import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DateTimeSettingsService } from '../../../../shared/services/date-time-settings.service';
import { LanguageSettingsService } from '../../../../shared/services/language-settings.service';
import type { SupportedLanguage } from '../../../../shared/services/language-settings.service';

@Component({
  selector: 'app-language-setting',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './language-setting.html',
  styleUrl: './language-setting.scss',
})
export class LanguageSetting {
  private readonly languageSettings = inject(LanguageSettingsService);
  private readonly dateTimeSettings = inject(DateTimeSettingsService);
  readonly language = this.languageSettings.language;
  readonly clockFormat = this.dateTimeSettings.clockFormat;
  readonly calendarFormat = this.dateTimeSettings.calendarFormat;

  setLanguage(event: Event): void {
    this.languageSettings.setLanguage((event.target as HTMLSelectElement).value as SupportedLanguage);
  }
}
