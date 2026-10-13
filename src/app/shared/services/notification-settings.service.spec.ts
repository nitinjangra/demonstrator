import { TestBed } from '@angular/core/testing';
import { NotificationSettingsService } from './notification-settings.service';

describe('NotificationSettingsService', () => {
  let service: NotificationSettingsService;
  const keys = [
    'notification-preference:email',
    'notification-preference:emailAsRespondent',
    'notification-preference:emailAsApprover',
    'notification-preference:sms',
    'notification-preference:call',
  ];

  beforeEach(() => {
    keys.forEach((key) => localStorage.removeItem(key));
    TestBed.configureTestingModule({ providers: [NotificationSettingsService] });
    service = TestBed.inject(NotificationSettingsService);
  });

  afterEach(() => keys.forEach((key) => localStorage.removeItem(key)));

  it('enables email sub-preferences by default and disables optional channels', () => {
    expect(service.preferences()).toEqual({
      email: true,
      emailAsRespondent: true,
      emailAsApprover: true,
      sms: false,
      call: false,
    });
  });

  it('updates and persists channel and email sub-preferences', () => {
    service.setPreference('email', false);
    service.setPreference('emailAsApprover', false);
    service.setPreference('sms', true);

    expect(service.preferences()).toEqual({
      email: false,
      emailAsRespondent: true,
      emailAsApprover: false,
      sms: true,
      call: false,
    });
    expect(localStorage.getItem('notification-preference:email')).toBe('false');
    expect(localStorage.getItem('notification-preference:emailAsApprover')).toBe('false');
    expect(localStorage.getItem('notification-preference:sms')).toBe('true');
  });
});
