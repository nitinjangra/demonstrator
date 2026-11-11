import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { ThemeToggleComponent } from './theme.component';
import { Theme, ThemeService } from '../services/theme.service';
import { By } from '@angular/platform-browser';
import { MatTooltip } from '@angular/material/tooltip';

describe('ThemeToggleComponent', () => {
  let component: ThemeToggleComponent;
  let fixture: ComponentFixture<ThemeToggleComponent>;
  let themeServiceSpy: jasmine.SpyObj<ThemeService>;
  let themeSignal: WritableSignal<Theme>;

  beforeEach(async () => {
    spyOn(window, 'matchMedia').and.returnValue({
      matches: true,
      media: '(prefers-color-scheme: dark)',
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => true,
    } as MediaQueryList);
    themeSignal = signal<Theme>('light');
    themeServiceSpy = jasmine.createSpyObj<ThemeService>('ThemeService', [
      'getTheme',
      'toggleTheme',
      'setTheme',
    ]);
    (themeServiceSpy as unknown as { theme: WritableSignal<Theme> }).theme = themeSignal;

    await TestBed.configureTestingModule({
      imports: [ThemeToggleComponent],
      providers: [{ provide: ThemeService, useValue: themeServiceSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct button label for light mode', () => {
    expect(component.label()).toBe('Switch to dark mode');
    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Switch to dark mode');
    expect(getComputedStyle(button).width).toBe('44px');
    expect(getComputedStyle(button).height).toBe('44px');
  });

  it('shows the current action in its tooltip on hover', fakeAsync(() => {
    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
    button.dispatchEvent(new MouseEvent('mouseenter'));
    tick();
    fixture.detectChanges();

    expect(document.querySelector('.mat-mdc-tooltip')?.textContent).toContain(
      'Switch to dark mode',
    );
    fixture.debugElement.query(By.css('button')).injector.get(MatTooltip).hide();
    tick();
  }));

  it('should call toggleTheme on the ThemeService when clicked', () => {
    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;

    button.click();

    expect(themeServiceSpy.toggleTheme).toHaveBeenCalled();
  });

  it('switches theme on standard keyboard activation', fakeAsync(() => {
    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
    button.dispatchEvent(new MouseEvent('click', { detail: 0 }));
    expect(themeServiceSpy.toggleTheme).toHaveBeenCalledTimes(1);
    tick();
  }));

  it('should update the button label when theme toggles to dark', () => {
    themeSignal.set('dark');
    fixture.detectChanges();

    expect(component.label()).toBe('Switch to light mode');
    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Switch to light mode');
  });
});
