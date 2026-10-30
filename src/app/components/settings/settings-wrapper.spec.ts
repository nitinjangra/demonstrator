import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { SettingsWrapper } from './settings-wrapper';

@Component({ standalone: true, template: '' })
class SettingsTestRoute {}

describe('SettingsWrapper', () => {
  let fixture: ComponentFixture<SettingsWrapper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsWrapper],
      providers: [provideRouter([{ path: 'settings/announcements', component: SettingsTestRoute }])],
    }).compileComponents();

    fixture = TestBed.createComponent(SettingsWrapper);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should show the General navigation group and its settings links', () => {
    const sidebar = fixture.nativeElement.querySelector(
      '[aria-label="Settings navigation"]',
    ) as HTMLElement;

    expect(sidebar.textContent).toContain('General');
    expect(sidebar.textContent).toContain('Branding');
    expect(sidebar.textContent).toContain('Time setting');
    expect(sidebar.textContent).toContain('Theme');
    expect(sidebar.textContent).toContain('Feature toggles');
    expect(sidebar.textContent).toContain('Notifications');
    expect(sidebar.textContent).toContain('Announcement settings');
    expect(sidebar.querySelector('a[href="/settings/general/branding"]')).not.toBeNull();
    expect(sidebar.querySelector('a[href="/settings/general/time"]')).not.toBeNull();
    expect(sidebar.querySelector('a[href="/settings/general/theme"]')).not.toBeNull();
    expect(sidebar.querySelector('a[href="/settings/general/feature-toggles"]')).not.toBeNull();
    expect(sidebar.querySelector('a[href="/settings/general/notifications"]')).not.toBeNull();
    expect(sidebar.querySelector('a[href="/settings/announcements"]')).not.toBeNull();

    const itemNames = Array.from(
      sidebar.querySelectorAll<HTMLAnchorElement>('a[mat-list-item]'),
    ).map((link) => link.querySelector('[matListItemTitle]')?.textContent?.trim());
    expect(itemNames).toEqual([
      'Branding',
      'Feature toggles',
      'Notifications',
      'Theme',
      'Time setting',
      'Announcement settings',
    ]);
  });

  it('minimizes and expands the settings menu while keeping its links available', () => {
    const toggle = fixture.nativeElement.querySelector('.sidebar-toggle') as HTMLButtonElement;
    const sidebar = fixture.nativeElement.querySelector('.settings-sidebar') as HTMLElement;

    expect(toggle.getAttribute('aria-label')).toBe('Minimize settings menu');
    toggle.click();
    fixture.detectChanges();

    expect(sidebar.classList).toContain('settings-sidebar--minimized');
    expect(fixture.nativeElement.querySelector('a[href="/settings/announcements"]')).not.toBeNull();
    expect(toggle.getAttribute('aria-label')).toBe('Expand settings menu');

    toggle.click();
    fixture.detectChanges();

    expect(sidebar.classList).not.toContain('settings-sidebar--minimized');
    expect(toggle.getAttribute('aria-label')).toBe('Minimize settings menu');
  });

  it('highlights announcement settings when its route is active', async () => {
    await TestBed.inject(Router).navigateByUrl('/settings/announcements');
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector(
      'a[href="/settings/announcements"]',
    ) as HTMLAnchorElement;
    expect(link.classList).toContain('settings-nav-link--active');
    expect(link.getAttribute('aria-current')).toBe('page');
  });
});
