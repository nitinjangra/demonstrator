import { computed, Injectable, signal } from '@angular/core';

const USER_NAME_KEY = 'user-name';
const ADMIN_MODE_KEY = 'admin-mode';

@Injectable({ providedIn: 'root' })
export class UserSettingsService {
  private readonly nameSignal = signal(localStorage.getItem(USER_NAME_KEY)?.trim() || 'there');
  private readonly adminSignal = signal(localStorage.getItem(ADMIN_MODE_KEY) !== 'false');

  readonly userName = computed(() => this.nameSignal());
  readonly firstName = computed(() => this.nameSignal().trim().split(/\s+/)[0] || 'there');
  readonly isAdmin = computed(() => this.adminSignal());

  setUserName(name: string): void {
    const normalized = name.trim();
    this.nameSignal.set(normalized || 'there');
    localStorage.setItem(USER_NAME_KEY, normalized);
  }

  setAdminMode(enabled: boolean): void {
    this.adminSignal.set(enabled);
    localStorage.setItem(ADMIN_MODE_KEY, String(enabled));
  }
}
