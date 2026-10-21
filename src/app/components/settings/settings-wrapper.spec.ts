import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SettingsWrapper } from './settings-wrapper';

describe('SettingsWrapper', () => {
  let fixture: ComponentFixture<SettingsWrapper>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsWrapper],
      providers: [provideRouter([])],
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
    ).map((link) => link.textContent.trim());
    expect(itemNames).toEqual([
      'Branding',
      'Feature toggles',
      'Notifications',
      'Theme',
      'Time setting',
      'Announcement settings',
    ]);
  });
});
