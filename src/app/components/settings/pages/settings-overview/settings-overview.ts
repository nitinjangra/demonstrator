import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { FeatureToggleService } from '../../../../shared/services/feature-toggle.service';

@Component({
  selector: 'app-settings-overview',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  templateUrl: './settings-overview.html',
  styleUrl: './settings-overview.scss',
})
export class SettingsOverview {
  readonly mockDriverEnabled = inject(FeatureToggleService).mockDriverEnabled;
}
