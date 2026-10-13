import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeSetting } from '../../../../components/settings/pages/theme-setting/Theme-setting';

describe('ThemeSetting', () => {
  let fixture: ComponentFixture<ThemeSetting>;

  beforeEach(async () => {
    localStorage.clear();
    spyOn(window, 'matchMedia').and.returnValue({ matches: false } as MediaQueryList);

    await TestBed.configureTestingModule({ imports: [ThemeSetting] }).compileComponents();
    fixture = TestBed.createComponent(ThemeSetting);
    fixture.detectChanges();
  });

  afterEach(() => localStorage.clear());

  it('should update and persist the selected theme', () => {
    const darkButton = fixture.nativeElement.querySelector(
      'mat-button-toggle[value="dark"] button',
    ) as HTMLButtonElement;

    darkButton.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.theme()).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(fixture.nativeElement.querySelector('.current-theme').textContent).toContain('dark');
  });

  it('should select the system theme preference', () => {
    const systemButton = fixture.nativeElement.querySelector(
      'mat-button-toggle[value="system"] button',
    ) as HTMLButtonElement;

    systemButton.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.preference()).toBe('system');
    expect(localStorage.getItem('theme')).toBe('system');
    expect(
      fixture.nativeElement
        .querySelector('mat-button-toggle[value="system"]')
        .classList.contains('mat-button-toggle-checked'),
    ).toBeTrue();
  });
});
