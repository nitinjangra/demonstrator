import { Injectable, Signal, signal } from '@angular/core';

export type Theme = 'light' | 'dark';
export type ThemePreference = Theme | 'system';

const STORAGE_KEY = 'theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly preferenceSignal = signal<ThemePreference>(this.resolveInitialPreference());
  private readonly themeSignal = signal<Theme>(this.resolveTheme(this.preferenceSignal()));
  readonly preference: Signal<ThemePreference> = this.preferenceSignal.asReadonly();
  readonly theme: Signal<Theme> = this.themeSignal.asReadonly();

  constructor() {
    this.applyTheme(this.themeSignal());
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
    systemTheme.addEventListener?.('change', () => {
      if (this.preferenceSignal() === 'system') {
        this.applyPreference('system');
      }
    });
  }

  setTheme(theme: ThemePreference) {
    this.preferenceSignal.set(theme);
    localStorage.setItem(STORAGE_KEY, theme);
    this.applyPreference(theme);
  }

  toggleTheme = () => {
    this.setTheme(this.themeSignal() === 'light' ? 'dark' : 'light');
  };

  getTheme() {
    return this.themeSignal();
  }

  private applyTheme(theme: Theme): void {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.setAttribute('data-ag-theme-mode', theme);
  }

  private resolveInitialPreference(): ThemePreference {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
    return 'system';
  }

  private resolveTheme(preference: ThemePreference): Theme {
    return preference === 'system'
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : preference;
  }

  private applyPreference(preference: ThemePreference): void {
    const theme = this.resolveTheme(preference);
    this.themeSignal.set(theme);
    this.applyTheme(theme);
  }
}
