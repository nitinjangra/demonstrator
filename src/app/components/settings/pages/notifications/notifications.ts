import { Component, computed, HostListener, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { StickyFooterComponent } from '../../../../shared/components/sticky-footer/sticky-footer.component';
import { UnsavedChangesDialogService } from '../../../../shared/components/unsaved-changes-dialog/unsaved-changes-dialog.component';
import {
  NotificationPreferenceKey,
  NotificationSettingsService,
} from '../../../../shared/services/notification-settings.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [MatButtonModule, MatSlideToggleModule, StickyFooterComponent],
  templateUrl: './notifications.html',
  styleUrl: './notifications.scss',
})
export class Notifications {
  private readonly notificationSettings = inject(NotificationSettingsService);
  private readonly unsavedChangesDialog = inject(UnsavedChangesDialogService);
  readonly preferences = this.notificationSettings.preferences;
  readonly draftPreferences = signal({ ...this.preferences() });
  readonly hasUnsavedChanges = computed(() => {
    const current = this.preferences();
    const draft = this.draftPreferences();
    return (Object.keys(current) as NotificationPreferenceKey[]).some(
      (key) => current[key] !== draft[key],
    );
  });

  setPreference(key: NotificationPreferenceKey, enabled: boolean): void {
    this.draftPreferences.update((preferences) => ({ ...preferences, [key]: enabled }));
  }

  saveChanges(): void {
    const preferences = this.draftPreferences();
    (Object.keys(preferences) as NotificationPreferenceKey[]).forEach((key) => {
      this.notificationSettings.setPreference(key, preferences[key]);
    });
  }

  @HostListener('window:beforeunload', ['$event'])
  warnBeforeLeaving(event: BeforeUnloadEvent): void {
    this.unsavedChangesDialog.warnBeforeUnload(event, this.hasUnsavedChanges());
  }

  canDeactivate(): boolean | import('rxjs').Observable<boolean> {
    return this.unsavedChangesDialog.confirmIfNeeded(this.hasUnsavedChanges());
  }
}
