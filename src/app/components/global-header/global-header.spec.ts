import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { GlobalHeaderComponent } from './global-header';

describe('Globalheader', () => {
  let component: GlobalHeaderComponent;
  let fixture: ComponentFixture<GlobalHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalHeaderComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalHeaderComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should render its brand and theme toggle without the disabled menu', () => {
    fixture.detectChanges();

    const brandLink = fixture.nativeElement.querySelector('.global-header-brand');
    expect(brandLink.textContent).toContain('Demonstrator');
    expect(brandLink.getAttribute('href')).toBe('/landing');
    expect(brandLink.querySelector('.global-header-home-icon')?.textContent.trim()).toBe('home');
    expect(fixture.nativeElement.querySelector('app-theme-toggle')).not.toBeNull();
    const settingsButton = fixture.nativeElement.querySelector('button[aria-label="Open settings"]');
    expect(settingsButton).not.toBeNull();
    expect(settingsButton.classList).toContain('settings-icon');
    expect(fixture.nativeElement.querySelector('[aria-label="Open navigation menu"]')).toBeNull();
    expect(component.canShowHamburgerMenu).toBeFalse();
  });

  it('shows the dashboard icon as the dashboard link', () => {
    fixture.detectChanges();

    const dashboardLink = fixture.nativeElement.querySelector('.global-header-dashboard') as HTMLAnchorElement;
    expect(dashboardLink.getAttribute('href')).toBe('/dashboard');
    expect(dashboardLink.getAttribute('aria-label')).toBe('Dashboard');
    expect(dashboardLink.querySelector('mat-icon')?.textContent?.trim()).toBe('dashboard');
    expect(dashboardLink.textContent?.trim()).toBe('dashboard');
  });
});
