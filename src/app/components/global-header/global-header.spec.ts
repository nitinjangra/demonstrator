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
    expect(brandLink.textContent.trim()).toBe('Demonstrator');
    expect(brandLink.getAttribute('href')).toBe('/landing');
    expect(brandLink.querySelector('.global-header-home-icon')?.textContent.trim()).toBe('home');
    expect(fixture.nativeElement.querySelector('app-theme-toggle')).not.toBeNull();
    const settingsButton = fixture.nativeElement.querySelector('button[aria-label="Open settings"]');
    expect(settingsButton).not.toBeNull();
    expect(settingsButton.classList).toContain('settings-icon');
    expect(fixture.nativeElement.querySelector('[aria-label="Open navigation menu"]')).toBeNull();
    expect(component.canShowHamburgerMenu).toBeFalse();
  });
});
