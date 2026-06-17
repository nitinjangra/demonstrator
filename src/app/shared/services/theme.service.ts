import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private currentTheme: 'light' | 'dark' = 'light';

  setTheme(theme: 'light' | 'dark') {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
  }

  toggleTheme = () => {
    this.setTheme(this.currentTheme === 'light' ? 'dark' : 'light');
  };

  getTheme() {
    return this.currentTheme;
  }
}
