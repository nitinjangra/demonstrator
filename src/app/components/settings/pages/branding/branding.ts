import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { StickyFooterComponent } from '../../../../shared/components/sticky-footer/sticky-footer.component';
import { BrandingService } from '../../../../shared/services/branding.service';

@Component({
  selector: 'app-branding',
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, StickyFooterComponent],
  template: `
    <section aria-labelledby="branding-title">
      <h2 id="branding-title">Branding</h2>
      <p>Set the name displayed in the application header.</p>
      <mat-form-field appearance="outline">
        <mat-label>Application name</mat-label>
        <input
          matInput
          maxlength="30"
          autocomplete="off"
          [value]="draftBrandName()"
          (input)="setDraftBrandName($any($event.target).value)"
        />
      </mat-form-field>
    </section>
    <app-sticky-footer [fixed]="false">
      <button matButton="filled" type="button" [disabled]="!hasUnsavedChanges()" (click)="saveChanges()">
        Save changes
      </button>
    </app-sticky-footer>
  `,
  styles: `
    :host {
      display: flex;
      min-height: 100%;
      flex-direction: column;
    }

    section { flex: 1 0 auto; }
    mat-form-field { width: 100%; }
    app-sticky-footer { margin-top: auto; }
  `,
})
export class Branding {
  private readonly branding = inject(BrandingService);
  readonly brandName = this.branding.brandName;
  readonly draftBrandName = signal(this.brandName());
  readonly hasUnsavedChanges = computed(() => this.draftBrandName() !== this.brandName());

  setDraftBrandName(name: string): void {
    this.draftBrandName.set(name);
  }

  saveChanges(): void {
    this.branding.setBrandName(this.draftBrandName());
  }
}
