import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { StickyFooterComponent } from '../../../../shared/components/sticky-footer/sticky-footer.component';
import { BrandingService } from '../../../../shared/services/branding.service';
import { UserSettingsService } from '../../../../shared/services/user-settings.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-branding',
  standalone: true,
  imports: [MatButtonModule, MatFormFieldModule, MatInputModule, MatSlideToggleModule, StickyFooterComponent],
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
      <h3>User</h3>
      <mat-form-field appearance="outline">
        <mat-label>Your name</mat-label>
        <input matInput maxlength="60" autocomplete="given-name" [value]="draftUserName()" (input)="setDraftUserName($any($event.target).value)" />
      </mat-form-field>
      <mat-slide-toggle [checked]="draftAdminMode()" (change)="draftAdminMode.set($event.checked)">
        Admin mode (announcement management)
      </mat-slide-toggle>
    </section>
    <app-sticky-footer [fixed]="false">
      <button
        matButton="filled"
        type="button"
        [disabled]="!hasUnsavedChanges()"
        (click)="saveChanges()"
      >
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

    section {
      flex: 1 0 auto;
    }
    mat-form-field {
      width: 100%;
      margin-top: 1rem;
    }
    app-sticky-footer {
      margin-top: auto;
    }
  `,
})
export class Branding {
  private readonly branding = inject(BrandingService);
  private readonly userSettings = inject(UserSettingsService);
  readonly brandName = this.branding.brandName;
  readonly draftBrandName = signal(this.brandName());
  readonly draftUserName = signal(this.userSettings.userName() === 'there' ? '' : this.userSettings.userName());
  readonly draftAdminMode = signal(this.userSettings.isAdmin());
  readonly hasUnsavedChanges = computed(
    () => this.draftBrandName() !== this.brandName() ||
      this.draftUserName().trim() !== this.userSettings.userName() ||
      this.draftAdminMode() !== this.userSettings.isAdmin(),
  );

  setDraftBrandName(name: string): void {
    this.draftBrandName.set(name);
  }

  setDraftUserName(name: string): void {
    this.draftUserName.set(name);
  }

  saveChanges(): void {
    this.branding.setBrandName(this.draftBrandName());
    this.userSettings.setUserName(this.draftUserName());
    this.userSettings.setAdminMode(this.draftAdminMode());
  }
}
