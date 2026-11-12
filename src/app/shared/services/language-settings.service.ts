import { Injectable, Signal, signal } from '@angular/core';

export type SupportedLanguage = 'en-US' | 'ar';

const LANGUAGE_KEY = 'language';

@Injectable({ providedIn: 'root' })
export class LanguageSettingsService {
  private readonly languageSignal = signal<SupportedLanguage>(this.readLanguage());

  readonly language: Signal<SupportedLanguage> = this.languageSignal.asReadonly();

  constructor() {
    this.applyDocumentLanguage(this.languageSignal());
  }

  setLanguage(language: SupportedLanguage): void {
    if (language === this.languageSignal()) return;

    this.languageSignal.set(language);
    localStorage.setItem(LANGUAGE_KEY, language);
    this.applyDocumentLanguage(language);
    window.location.reload();
  }

  private readLanguage(): SupportedLanguage {
    return localStorage.getItem(LANGUAGE_KEY) === 'ar' ? 'ar' : 'en-US';
  }

  private applyDocumentLanguage(language: SupportedLanguage): void {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }
}
