import { TestBed } from '@angular/core/testing';
import { DateTimeSettingsService } from './date-time-settings.service';

describe('DateTimeSettingsService', () => {
  let service: DateTimeSettingsService;

  beforeEach(() => {
    localStorage.removeItem('clock-format');
    localStorage.removeItem('calendar-format');
    TestBed.configureTestingModule({ providers: [DateTimeSettingsService] });
    service = TestBed.inject(DateTimeSettingsService);
  });

  afterEach(() => {
    localStorage.removeItem('clock-format');
    localStorage.removeItem('calendar-format');
  });

  it('formats date and time with the selected formats', () => {
    const date = new Date(2024, 0, 5, 13, 7);

    expect(service.formatDateTime(date)).toBe('05-01-2024 01:07 PM');

    service.setClockFormat('24h');
    service.setCalendarFormat('mm-dd-yyyy');

    expect(service.formatDateTime(date)).toBe('01-05-2024 13:07');
    expect(localStorage.getItem('clock-format')).toBe('24h');
    expect(localStorage.getItem('calendar-format')).toBe('mm-dd-yyyy');
  });

  it('preserves date-only ISO values as local calendar dates', () => {
    expect(service.formatDateTime('2024-01-05')).toBe('05-01-2024 12:00 AM');
  });
});
