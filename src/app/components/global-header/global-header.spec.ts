import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { GlobalHeaderComponent } from './global-header';

@Component({ standalone: true, template: '' })
class SettingsOverviewTestRoute {}

describe('Globalheader', () => {
  let component: GlobalHeaderComponent;
  let fixture: ComponentFixture<GlobalHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalHeaderComponent],
      providers: [provideRouter([{ path: 'settings/overview', component: SettingsOverviewTestRoute }])],
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalHeaderComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should render its linked brand and theme toggle without the disabled menu', () => {
    fixture.detectChanges();

    const brand = fixture.nativeElement.querySelector('.global-header-brand');
    expect(brand.textContent).toContain('Demonstrator');
    expect(brand.querySelector('.global-header-home-icon')?.textContent.trim()).toBe('home');
    const homeLink = brand as HTMLAnchorElement;
    expect(homeLink.getAttribute('href')).toBe('/landing');
    expect(homeLink.getAttribute('aria-label')).toBe('Home');
    expect(brand.closest('a')).toBe(homeLink);
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

  it('navigates to the settings overview when the settings button is clicked', async () => {
    fixture.detectChanges();

    const settingsButton = fixture.nativeElement.querySelector(
      'button[aria-label="Open settings"]',
    ) as HTMLButtonElement;
    settingsButton.click();
    await fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/settings/overview');
  });

  it('identifies profile switching as a demo control', () => {
    fixture.detectChanges();
    (fixture.nativeElement.querySelector('.user-icon') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(document.body.textContent).toContain('Demo profiles only; no access authorization');
  });

});
