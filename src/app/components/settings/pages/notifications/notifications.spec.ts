import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { NotificationSettingsService } from '../../../../shared/services/notification-settings.service';
import { Notifications } from './notifications';

describe('Notifications', () => {
  let fixture: ComponentFixture<Notifications>;
  let settingsSpy: jasmine.SpyObj<NotificationSettingsService>;

  beforeEach(async () => {
    settingsSpy = jasmine.createSpyObj<NotificationSettingsService>(
      'NotificationSettingsService',
      ['setPreference'],
      {
        preferences: signal({
          email: true,
          emailAsRespondent: true,
          emailAsApprover: false,
          sms: false,
          call: false,
        }),
      },
    );

    await TestBed.configureTestingModule({
      imports: [Notifications],
      providers: [{ provide: NotificationSettingsService, useValue: settingsSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(Notifications);
    fixture.detectChanges();
  });

  it('renders the available notification settings', () => {
    expect(fixture.nativeElement.textContent).toContain('Notifications');
    expect(fixture.nativeElement.textContent).toContain('Email');
    expect(fixture.nativeElement.textContent).toContain('SMS');
    expect(fixture.nativeElement.textContent).toContain('Phone call');
  });

  it('delegates preference changes to the settings service', () => {
    fixture.componentInstance.setPreference('sms', true);

    expect(settingsSpy.setPreference).toHaveBeenCalledWith('sms', true);
  });
});
