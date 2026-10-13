import { Component, inject } from '@angular/core';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import {
  NotificationPreferenceKey,
  NotificationSettingsService,
} from '../../../../shared/services/notification-settings.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [MatSlideToggleModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications {
  private readonly notificationSettings = inject(NotificationSettingsService);
  readonly preferences = this.notificationSettings.preferences;

  setPreference(key: NotificationPreferenceKey, enabled: boolean): void {
    this.notificationSettings.setPreference(key, enabled);
  }
}
