import { Injectable, computed, signal } from '@angular/core';

const BRAND_NAME_KEY = 'brand-name';
const DEFAULT_BRAND_NAME = 'Demonstrator';

@Injectable({ providedIn: 'root' })
export class BrandingService {
  private readonly brandNameSignal = signal(this.readBrandName());

  readonly brandName = this.brandNameSignal.asReadonly();
  readonly displayName = computed(() => this.brandNameSignal().trim() || DEFAULT_BRAND_NAME);

  setBrandName(name: string): void {
    this.brandNameSignal.set(name);
    localStorage.setItem(BRAND_NAME_KEY, name);
  }

  private readBrandName(): string {
    const stored = localStorage.getItem(BRAND_NAME_KEY);
    return stored?.trim() ? stored : DEFAULT_BRAND_NAME;
  }
}
