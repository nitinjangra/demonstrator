import { TestBed } from '@angular/core/testing';
import { BrandingService } from './branding.service';

describe('BrandingService', () => {
  let service: BrandingService;

  beforeEach(() => {
    localStorage.removeItem('brand-name');
    TestBed.configureTestingModule({ providers: [BrandingService] });
    service = TestBed.inject(BrandingService);
  });

  afterEach(() => localStorage.removeItem('brand-name'));

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
});
