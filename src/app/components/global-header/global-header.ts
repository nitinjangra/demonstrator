import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterLink } from '@angular/router';
import { ThemeToggleComponent } from '../../shared/components/theme.component';
import { BrandingService } from '../../shared/services/branding.service';
import { FeatureToggleService } from '../../shared/services/feature-toggle.service';

@Component({
  selector: 'app-global-header',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    RouterLink,
    ThemeToggleComponent,
  ],
  templateUrl: './global-header.html',
  styleUrls: ['./global-header.scss'],
})
export class GlobalHeaderComponent {
  canShowHamburgerMenu = false;
  readonly brandName = inject(BrandingService).displayName;
  readonly dashboardEnabled = inject(FeatureToggleService).dashboardEnabled;
}
