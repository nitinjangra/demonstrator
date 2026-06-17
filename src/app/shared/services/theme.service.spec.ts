import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ThemeService],
    });
    service = TestBed.inject(ThemeService);
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
  });

  it('should toggle the theme from light to dark', () => {
    const setAttributeSpy = spyOn(document.documentElement, 'setAttribute');

    service.toggleTheme();

    expect(service.getTheme()).toBe('dark');
    expect(setAttributeSpy).toHaveBeenCalledWith('data-theme', 'dark');
  });

  it('should toggle the theme from dark back to light', () => {
    service.setTheme('dark');
    const setAttributeSpy = spyOn(document.documentElement, 'setAttribute');

    service.toggleTheme();

    expect(service.getTheme()).toBe('light');
    expect(setAttributeSpy).toHaveBeenCalledWith('data-theme', 'light');
  });
});
