import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { BrandingService } from '../../../../shared/services/branding.service';
import { Branding } from './branding';

describe('Branding', () => {
  let fixture: ComponentFixture<Branding>;
  let brandingSpy: jasmine.SpyObj<BrandingService>;

  beforeEach(async () => {
    brandingSpy = jasmine.createSpyObj<BrandingService>(
      'BrandingService',
      ['setBrandName'],
      { brandName: signal('Example app') },
    );

    await TestBed.configureTestingModule({
      imports: [Branding],
      providers: [{ provide: BrandingService, useValue: brandingSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(Branding);
    fixture.detectChanges();
  });

  it('renders the current application name', () => {
    expect(fixture.nativeElement.textContent).toContain('Branding');
    expect((fixture.nativeElement.querySelector('input') as HTMLInputElement).value).toBe(
      'Example app',
    );
  });

  it('delegates name updates to the branding service', () => {
    fixture.componentInstance.setBrandName('New name');

    expect(brandingSpy.setBrandName).toHaveBeenCalledWith('New name');
  });
});
