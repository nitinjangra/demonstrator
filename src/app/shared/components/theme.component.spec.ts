import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeToggleComponent } from './theme.component';
import { ThemeService } from '../services/theme.service';
import { By } from '@angular/platform-browser';

describe('ThemeToggleComponent', () => {
  let component: ThemeToggleComponent;
  let fixture: ComponentFixture<ThemeToggleComponent>;
  let themeServiceSpy: jasmine.SpyObj<ThemeService>;

  beforeEach(async () => {
    themeServiceSpy = jasmine.createSpyObj<ThemeService>('ThemeService', [
      'getTheme',
      'toggleTheme',
      'setTheme',
    ]);
    themeServiceSpy.getTheme.and.returnValue('light');

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
    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;

    expect(button.textContent?.trim()).toBe('Switch to Dark Mode');
  });

  it('should call toggleTheme on the ThemeService when clicked', () => {
    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;

    button.click();

    expect(themeServiceSpy.toggleTheme).toHaveBeenCalled();
  });

  it('should update the button label when theme toggles to dark', () => {
    themeServiceSpy.getTheme.and.returnValue('dark');
    fixture.detectChanges();

    const button = fixture.debugElement.query(By.css('button')).nativeElement as HTMLButtonElement;

    expect(button.textContent?.trim()).toBe('Switch to Light Mode');
  });
});
