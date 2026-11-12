import { computed, Injectable, signal } from '@angular/core';
import { ACTIVE_TENANT_KEY, ADMIN_MODE_KEY, USER_NAME_KEY } from '../constants/user-settings.const';

export type PredefinedUserProfileId = 'admin' | 'standard' | 'invited';

export const PREDEFINED_USER_PROFILES: ReadonlyArray<{
  id: PredefinedUserProfileId;
  tenantId: string;
  name: string;
  isAdmin: boolean;
  description: string;
}> = [
  { id: 'admin', tenantId: 'admin-profile', name: 'Admin', isAdmin: true, description: 'Full access' },
  { id: 'standard', tenantId: 'standard-profile', name: 'Standard user', isAdmin: false, description: 'No admin privileges' },
  { id: 'invited', tenantId: 'invited-profile', name: 'Invited user', isAdmin: false, description: 'Invited account flow' },
];

const ACTIVE_PROFILE_KEY = 'active-user-profile';

// Profiles are browser-local demo personas. They are intentionally not a trusted identity source.
function readInitialProfileId(): PredefinedUserProfileId {
  const saved = localStorage.getItem(ACTIVE_PROFILE_KEY);
  if (saved === 'admin' || saved === 'standard' || saved === 'invited') return saved;
  return localStorage.getItem(ADMIN_MODE_KEY) === 'false' ? 'standard' : 'admin';
}

@Injectable({ providedIn: 'root' })
export class UserSettingsService {
  private readonly profileIdSignal = signal(readInitialProfileId());
  private readonly activeProfile = computed(
    () => PREDEFINED_USER_PROFILES.find(({ id }) => id === this.profileIdSignal())!,
  );
  private readonly tenantIdSignal = signal(this.activeProfile().tenantId);

  readonly profileId = computed(() => this.profileIdSignal());
  readonly tenantId = computed(() => this.tenantIdSignal());
  readonly userName = computed(() => this.activeProfile().name);
  readonly firstName = computed(() => this.activeProfile().name);
  readonly isAdmin = computed(() => this.activeProfile().isAdmin);
  readonly isInvited = computed(() => this.profileIdSignal() === 'invited');

  switchProfile(profileId: PredefinedUserProfileId): void {
    const profile = PREDEFINED_USER_PROFILES.find(({ id }) => id === profileId);
    if (!profile) return;

    this.profileIdSignal.set(profile.id);
    this.tenantIdSignal.set(profile.tenantId);
    localStorage.setItem(ACTIVE_PROFILE_KEY, profile.id);
    localStorage.setItem(ACTIVE_TENANT_KEY, profile.tenantId);
    localStorage.setItem(USER_NAME_KEY, profile.name);
    localStorage.setItem(ADMIN_MODE_KEY, String(profile.isAdmin));
  }

}
