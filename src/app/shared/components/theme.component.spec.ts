import { ComponentFixture, TestBed } from '@angular/core/testing';
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
    expect(component.label()).toBe('Switch to Dark Mode');
  });

  it('should call toggleTheme on the ThemeService when clicked', () => {
    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;

    button.click();

    expect(themeServiceSpy.toggleTheme).toHaveBeenCalled();
  });

  it('should update the button label when theme toggles to dark', () => {
    themeSignal.set('dark');
    fixture.detectChanges();

    expect(component.label()).toBe('Switch to Light Mode');
  });
});
