import { Injectable, signal } from '@angular/core';

export interface NotificationPreferences {
  email: boolean;
  emailAsRespondent: boolean;
  emailAsApprover: boolean;
  sms: boolean;
  call: boolean;
}

export type NotificationPreferenceKey = keyof NotificationPreferences;

const STORAGE_PREFIX = 'notification-preference:';

@Injectable({ providedIn: 'root' })
export class NotificationSettingsService {
  private readonly preferencesSignal = signal<NotificationPreferences>({
    email: this.readPreference('email', true),
    emailAsRespondent: this.readPreference('emailAsRespondent', true),
    emailAsApprover: this.readPreference('emailAsApprover', true),
    sms: this.readPreference('sms', false),
    call: this.readPreference('call', false),
  });

  readonly preferences = this.preferencesSignal.asReadonly();

  setPreference(key: NotificationPreferenceKey, enabled: boolean): void {
    this.preferencesSignal.update((preferences) => ({ ...preferences, [key]: enabled }));
    localStorage.setItem(`${STORAGE_PREFIX}${key}`, String(enabled));
  }

  private readPreference(key: NotificationPreferenceKey, defaultValue: boolean): boolean {
    const stored = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    return stored === null ? defaultValue : stored === 'true';
  }
}
