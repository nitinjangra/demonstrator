import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltip } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ThemeToggleComponent } from '../../shared/components/theme.component';
import { UnsavedChangesDialogService } from '../../shared/components/unsaved-changes-dialog/unsaved-changes-dialog.component';
import { BrandingService } from '../../shared/services/branding.service';
import { FeatureToggleService } from '../../shared/services/feature-toggle.service';
import {
  LanguageSettingsService,
  type SupportedLanguage,
} from '../../shared/services/language-settings.service';
import {
  PREDEFINED_USER_PROFILES,
  type PredefinedUserProfileId,
  UserSettingsService,
} from '../../shared/services/user-settings.service';

@Component({
  selector: 'app-global-header',
  standalone: true,
  imports: [
    MatToolbarModule,
    MatTooltip,
    MatButtonModule,
    MatDividerModule,
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
  private readonly branding = inject(BrandingService);
  readonly brandName = this.branding.displayName;
  readonly brandMode = this.branding.brandMode;
  readonly brandLogo = this.branding.brandLogo;
  readonly brandAltText = this.branding.brandAltText;
  readonly dashboardEnabled = inject(FeatureToggleService).dashboardEnabled;
  private readonly userSettings = inject(UserSettingsService);
  private readonly languageSettings = inject(LanguageSettingsService);
  private readonly unsavedChangesDialog = inject(UnsavedChangesDialogService);
  readonly userName = this.userSettings.firstName;
  readonly isAdmin = this.userSettings.isAdmin;
  readonly userProfiles = PREDEFINED_USER_PROFILES;
  readonly language = this.languageSettings.language;

  async setLanguage(language: SupportedLanguage): Promise<void> {
    if (language === this.languageSettings.language()) return;
    if (!(await firstValueFrom(this.unsavedChangesDialog.confirmActivePageExit()))) return;
    this.languageSettings.setLanguage(language);
  }

  async selectProfile(profileId: PredefinedUserProfileId): Promise<void> {
    if (this.userSettings.profileId() === profileId) return;
    if (!(await firstValueFrom(this.unsavedChangesDialog.confirmActivePageExit()))) return;
    this.userSettings.switchProfile(profileId);
    window.location.reload();
  }
}
