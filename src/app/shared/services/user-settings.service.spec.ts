import { TestBed } from '@angular/core/testing';
import { UserSettingsService } from './user-settings.service';

describe('UserSettingsService', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => localStorage.clear());

  it('uses the admin profile by default and switches profile with tenant scoped state', () => {
    TestBed.configureTestingModule({});
    const service = TestBed.inject(UserSettingsService);
    expect(service.profileId()).toBe('admin');
    expect(service.tenantId()).toBe('admin-profile');
    expect(service.isAdmin()).toBeTrue();
    expect(service.isInvited()).toBeFalse();

    service.switchProfile('standard');
    expect(service.profileId()).toBe('standard');
    expect(service.tenantId()).toBe('standard-profile');
    expect(service.isAdmin()).toBeFalse();
    expect(localStorage.getItem('active-user-profile')).toBe('standard');
    expect(localStorage.getItem('active-tenant-id')).toBe('standard-profile');

    service.switchProfile('invited');
    expect(service.isInvited()).toBeTrue();
    expect(service.userName()).toBe('Invited user');
  });

  it('ignores unknown profile ids and restores a valid persisted profile', () => {
    localStorage.setItem('active-user-profile', 'standard');
    TestBed.configureTestingModule({});
    const service = TestBed.inject(UserSettingsService);
    expect(service.profileId()).toBe('standard');
    service.switchProfile('unknown' as never);
    expect(service.profileId()).toBe('standard');
  });

  it('falls back to admin or standard based on the legacy admin setting', () => {
    localStorage.setItem('active-user-profile', 'invalid');
    localStorage.setItem('admin-mode', 'false');
    TestBed.configureTestingModule({});
    expect(TestBed.inject(UserSettingsService).profileId()).toBe('standard');
  });
});
