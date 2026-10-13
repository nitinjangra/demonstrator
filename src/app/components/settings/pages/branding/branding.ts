import { Component, inject } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrandingService } from '../../../../shared/services/branding.service';

@Component({
  selector: 'app-branding',
  standalone: true,
  imports: [MatFormFieldModule, MatInputModule],
  template: `
    <section aria-labelledby="branding-title">
      <h2 id="branding-title">Branding</h2>
      <p>Set the name displayed in the application header.</p>
      <mat-form-field appearance="outline">
        <mat-label>Application name</mat-label>
        <input
          matInput
          maxlength="40"
          autocomplete="off"
          [value]="brandName()"
          (input)="setBrandName($any($event.target).value)"
        />
      </mat-form-field>
    </section>
  `,
})
export class Branding {
  private readonly branding = inject(BrandingService);
  readonly brandName = this.branding.brandName;

  setBrandName(name: string): void {
    this.branding.setBrandName(name);
  }
}
