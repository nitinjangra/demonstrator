import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { ThemeToggleComponent } from './theme.component';
import { Theme, ThemeService } from '../services/theme.service';
import { By } from '@angular/platform-browser';

describe('ThemeToggleComponent', () => {
  let component: ThemeToggleComponent;
  let fixture: ComponentFixture<ThemeToggleComponent>;
  let themeServiceSpy: jasmine.SpyObj<ThemeService>;
  let themeSignal: WritableSignal<Theme>;

  beforeEach(async () => {
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

  it('should call toggleTheme on the ThemeService when clicked', () => {
    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;

    button.click();

    expect(themeServiceSpy.toggleTheme).toHaveBeenCalled();
  });

  it('should switch themes after the button is held for two seconds', fakeAsync(() => {
    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;

    button.dispatchEvent(new PointerEvent('pointerdown', { button: 0, isPrimary: true }));
    fixture.detectChanges();
    expect(component.isHolding()).toBeTrue();
    expect(button.classList).toContain('theme-toggle--holding');

    tick(1999);
    expect(themeServiceSpy.toggleTheme).not.toHaveBeenCalled();

    tick(1);
    expect(themeServiceSpy.toggleTheme).toHaveBeenCalledTimes(1);
    expect(component.isHolding()).toBeFalse();
  }));

  it('should cancel the switch when the button is released early', fakeAsync(() => {
    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;

    button.dispatchEvent(new PointerEvent('pointerdown', { button: 0, isPrimary: true }));
    tick(1000);
    button.dispatchEvent(new PointerEvent('pointerup'));
    tick(1000);

    expect(themeServiceSpy.toggleTheme).not.toHaveBeenCalled();
    expect(component.isHolding()).toBeFalse();
  }));

  it('should switch themes after the button is held with the keyboard for two seconds', fakeAsync(() => {
    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;

    button.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', cancelable: true }));
    tick(2000);
    button.dispatchEvent(new KeyboardEvent('keyup', { key: ' ', cancelable: true }));

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
