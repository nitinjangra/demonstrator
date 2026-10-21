import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { DateTimeSettingsService } from '../../../../shared/services/date-time-settings.service';
import { TimeSetting } from './time-setting';

describe('TimeSetting', () => {
  let fixture: ComponentFixture<TimeSetting>;
  let settingsSpy: jasmine.SpyObj<DateTimeSettingsService>;

  beforeEach(async () => {
    settingsSpy = jasmine.createSpyObj<DateTimeSettingsService>(
      'DateTimeSettingsService',
      ['setClockFormat', 'setCalendarFormat'],
      { clockFormat: signal('24h'), calendarFormat: signal('dd-mm-yyyy') },
    );

    await TestBed.configureTestingModule({
      imports: [TimeSetting],
      providers: [{ provide: DateTimeSettingsService, useValue: settingsSpy }],
    }).compileComponents();

    fixture = TestBed.createComponent(TimeSetting);
    fixture.detectChanges();
  });

  it('renders the time and date format controls', () => {
    expect(fixture.nativeElement.textContent).toContain('Time format');
    expect(fixture.nativeElement.textContent).toContain('Date format');
    expect(fixture.nativeElement.textContent).toContain('12-hour');
    expect(fixture.nativeElement.textContent).toContain('DD-MM-YYYY');
  });

  it('delegates the selected formats to the settings service', () => {
    fixture.componentInstance.setClockFormat('12h');
    fixture.componentInstance.setCalendarFormat('mm-dd-yyyy');

    expect(settingsSpy.setClockFormat).toHaveBeenCalledWith('12h');
    expect(settingsSpy.setCalendarFormat).toHaveBeenCalledWith('mm-dd-yyyy');
  });
});
