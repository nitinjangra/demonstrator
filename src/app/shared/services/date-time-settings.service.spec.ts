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

  it('formats midnight and noon as 12 AM and 12 PM', () => {
    expect(service.formatDateTime(new Date(2024, 0, 5, 0, 0))).toBe('05-01-2024 12:00 AM');
    expect(service.formatDateTime(new Date(2024, 0, 5, 12, 0))).toBe('05-01-2024 12:00 PM');
  });

  it('returns an empty string for an invalid date', () => {
    expect(service.formatDateTime('not a date')).toBe('');
  });

  it('formats a localized date-only label and rejects invalid dates', () => {
    expect(service.formatDateOnly(new Date(2024, 0, 5), 'en-US')).toBe('Jan 5, 2024');
    expect(service.formatDateOnly('not a date', 'en-US')).toBe('');
    expect(service.formatDateOnly('2024-01-05', 'ar')).toContain('يناير');
  });

  it('formats a date and time tooltip using the selected clock format', () => {
    const date = new Date(2024, 0, 5, 13, 7);
    expect(service.formatDateTooltip(date, 'en-US')).toContain('1:07 PM');
    service.setClockFormat('24h');
    expect(service.formatDateTooltip(date, 'en-US')).toContain('13:07');
    expect(service.formatDateTooltip('not a date', 'en-US')).toBe('');
  });

  it('uses stored formats when the service is initialized', () => {
    localStorage.setItem('clock-format', '24h');
    localStorage.setItem('calendar-format', 'mm-dd-yyyy');
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [DateTimeSettingsService] });
    service = TestBed.inject(DateTimeSettingsService);

    expect(service.formatDateTime(new Date(2024, 0, 5, 13, 7))).toBe('01-05-2024 13:07');
  });
});
