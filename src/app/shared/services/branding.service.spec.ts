import { TestBed } from '@angular/core/testing';
import { BrandingService } from './branding.service';

describe('BrandingService', () => {
  let service: BrandingService;

  beforeEach(() => {
    localStorage.removeItem('brand-name');
    localStorage.removeItem('brand-mode');
    localStorage.removeItem('brand-logo');
    localStorage.removeItem('brand-logo-name');
    localStorage.removeItem('brand-logo-size');
    localStorage.removeItem('brand-alt-text');
    TestBed.configureTestingModule({ providers: [BrandingService] });
    service = TestBed.inject(BrandingService);
  });

  afterEach(() => {
    localStorage.removeItem('brand-name');
    localStorage.removeItem('brand-mode');
    localStorage.removeItem('brand-logo');
    localStorage.removeItem('brand-logo-name');
    localStorage.removeItem('brand-logo-size');
    localStorage.removeItem('brand-alt-text');
  });

  it('uses the default name when no saved name exists', () => {
    expect(service.brandName()).toBe('Demonstrator');
    expect(service.displayName()).toBe('Demonstrator');
  });

  it('restores a saved name and trims it for display', () => {
    localStorage.setItem('brand-name', '  Example Co  ');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [BrandingService] });
    service = TestBed.inject(BrandingService);

    expect(service.brandName()).toBe('  Example Co  ');
    expect(service.displayName()).toBe('Example Co');
  });

  it('falls back to the default for a blank saved or updated name', () => {
    localStorage.setItem('brand-name', '   ');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [BrandingService] });
    service = TestBed.inject(BrandingService);
    expect(service.displayName()).toBe('Demonstrator');

    service.setBrandName('  ');
    expect(service.displayName()).toBe('Demonstrator');
    expect(localStorage.getItem('brand-name')).toBe('  ');
  });

  it('persists logo metadata and accessible alt text and clears metadata with the logo', () => {
    service.setBrandLogo('data:image/png;base64,abc', 'logo.png', 1024);
    service.setBrandAltText('Company logo');

    expect(service.brandLogoName()).toBe('logo.png');
    expect(service.brandLogoSize()).toBe(1024);
    expect(service.brandAltText()).toBe('Company logo');

    service.setBrandLogo('');
    expect(service.brandLogoName()).toBe('');
    expect(service.brandLogoSize()).toBe(0);
  });
});
