import { Injectable, computed, signal } from '@angular/core';

const BRAND_NAME_KEY = 'brand-name';
const BRAND_MODE_KEY = 'brand-mode';
const BRAND_LOGO_KEY = 'brand-logo';
const BRAND_LOGO_NAME_KEY = 'brand-logo-name';
const BRAND_LOGO_SIZE_KEY = 'brand-logo-size';
const BRAND_ALT_TEXT_KEY = 'brand-alt-text';
const DEFAULT_BRAND_NAME = 'Demonstrator';

export type BrandDisplayMode = 'label' | 'image';

@Injectable({ providedIn: 'root' })
export class BrandingService {
  private readonly brandNameSignal = signal(this.readBrandName());
  private readonly brandModeSignal = signal<BrandDisplayMode>(this.readBrandMode());
  private readonly brandLogoSignal = signal(localStorage.getItem(BRAND_LOGO_KEY) ?? '');
  private readonly brandLogoNameSignal = signal(localStorage.getItem(BRAND_LOGO_NAME_KEY) ?? '');
  private readonly brandLogoSizeSignal = signal(Number(localStorage.getItem(BRAND_LOGO_SIZE_KEY) ?? 0));
  private readonly brandAltTextSignal = signal(localStorage.getItem(BRAND_ALT_TEXT_KEY) ?? '');

  readonly brandName = this.brandNameSignal.asReadonly();
  readonly displayName = computed(() => this.brandNameSignal().trim() || DEFAULT_BRAND_NAME);
  readonly brandMode = this.brandModeSignal.asReadonly();
  readonly brandLogo = this.brandLogoSignal.asReadonly();
  readonly brandLogoName = this.brandLogoNameSignal.asReadonly();
  readonly brandLogoSize = this.brandLogoSizeSignal.asReadonly();
  readonly brandAltText = this.brandAltTextSignal.asReadonly();

  setBrandName(name: string): void {
    this.brandNameSignal.set(name);
    localStorage.setItem(BRAND_NAME_KEY, name);
  }

  setBrandMode(mode: BrandDisplayMode): void {
    this.brandModeSignal.set(mode);
    localStorage.setItem(BRAND_MODE_KEY, mode);
  }

  setBrandLogo(dataUrl: string, filename = '', size = 0): void {
    this.brandLogoSignal.set(dataUrl);
    this.brandLogoNameSignal.set(dataUrl ? filename : '');
    this.brandLogoSizeSignal.set(dataUrl ? size : 0);
    if (dataUrl) {
      localStorage.setItem(BRAND_LOGO_KEY, dataUrl);
      localStorage.setItem(BRAND_LOGO_NAME_KEY, filename);
      localStorage.setItem(BRAND_LOGO_SIZE_KEY, String(size));
    } else {
      localStorage.removeItem(BRAND_LOGO_KEY);
      localStorage.removeItem(BRAND_LOGO_NAME_KEY);
      localStorage.removeItem(BRAND_LOGO_SIZE_KEY);
    }
  }

  setBrandAltText(altText: string): void {
    this.brandAltTextSignal.set(altText);
    localStorage.setItem(BRAND_ALT_TEXT_KEY, altText);
  }

  private readBrandMode(): BrandDisplayMode {
    return localStorage.getItem(BRAND_MODE_KEY) === 'image' ? 'image' : 'label';
  }

  private readBrandName(): string {
    const stored = localStorage.getItem(BRAND_NAME_KEY);
    return stored?.trim() ? stored : DEFAULT_BRAND_NAME;
  }
}
