import { Injectable, Signal, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly themeSignal = signal<Theme>(this.resolveInitialTheme());
  readonly theme: Signal<Theme> = this.themeSignal.asReadonly();

  constructor() {
    document.documentElement.setAttribute('data-theme', this.themeSignal());
  }

  setTheme(theme: Theme) {
    this.themeSignal.set(theme);
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }

  toggleTheme = () => {
    this.setTheme(this.themeSignal() === 'light' ? 'dark' : 'light');
  };

  getTheme() {
    return this.themeSignal();
  }

  private resolveInitialTheme(): Theme {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') {
      return stored;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
}
