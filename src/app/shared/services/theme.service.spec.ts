import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;
  let systemThemeIsDark: boolean;
  let systemThemeListener: ((event: MediaQueryListEvent) => void) | undefined;

  beforeEach(() => {
    localStorage.clear();
    systemThemeIsDark = false;
    systemThemeListener = undefined;
    const mediaQuery = {
      get matches() {
        return systemThemeIsDark;
      },
      addEventListener: (_type: string, listener: (event: MediaQueryListEvent) => void) => {
        systemThemeListener = listener;
      },
    } as unknown as MediaQueryList;
    spyOn(window, 'matchMedia').and.returnValue(mediaQuery);

    TestBed.configureTestingModule({
      providers: [ThemeService],
    });
    service = TestBed.inject(ThemeService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the default theme as light', () => {
    expect(service.getTheme()).toBe('light');
  });

  it('should set the theme to dark and update the document attribute', () => {
    const setAttributeSpy = spyOn(document.documentElement, 'setAttribute');

    service.setTheme('dark');

    expect(service.getTheme()).toBe('dark');
    expect(setAttributeSpy).toHaveBeenCalledWith('data-theme', 'dark');
    expect(setAttributeSpy).toHaveBeenCalledWith('data-ag-theme-mode', 'dark');
  });

  it('should toggle the theme from light to dark', () => {
    const setAttributeSpy = spyOn(document.documentElement, 'setAttribute');

    service.toggleTheme();

    expect(service.getTheme()).toBe('dark');
    expect(setAttributeSpy).toHaveBeenCalledWith('data-theme', 'dark');
    expect(setAttributeSpy).toHaveBeenCalledWith('data-ag-theme-mode', 'dark');
  });

  it('should toggle the theme from dark back to light', () => {
    service.setTheme('dark');
    const setAttributeSpy = spyOn(document.documentElement, 'setAttribute');

    service.toggleTheme();

    expect(service.getTheme()).toBe('light');
    expect(setAttributeSpy).toHaveBeenCalledWith('data-theme', 'light');
    expect(setAttributeSpy).toHaveBeenCalledWith('data-ag-theme-mode', 'light');
  });

  it('should apply system theme changes while following the system preference', () => {
    service.setTheme('system');
    expect(service.getTheme()).toBe('light');

    systemThemeIsDark = true;
    systemThemeListener?.({ matches: true } as MediaQueryListEvent);

    expect(service.preference()).toBe('system');
    expect(service.getTheme()).toBe('dark');
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });
});
