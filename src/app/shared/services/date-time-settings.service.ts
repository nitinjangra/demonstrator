import { Injectable, Signal, signal } from '@angular/core';

export type ClockFormat = '12h' | '24h';
export type CalendarFormat = 'dd-mm-yyyy' | 'mm-dd-yyyy';

const CLOCK_FORMAT_KEY = 'clock-format';
const CALENDAR_FORMAT_KEY = 'calendar-format';

@Injectable({ providedIn: 'root' })
export class DateTimeSettingsService {
  private readonly clockFormatSignal = signal<ClockFormat>(this.readClockFormat());
  private readonly calendarFormatSignal = signal<CalendarFormat>(this.readCalendarFormat());

  readonly clockFormat: Signal<ClockFormat> = this.clockFormatSignal.asReadonly();
  readonly calendarFormat: Signal<CalendarFormat> = this.calendarFormatSignal.asReadonly();

  setClockFormat(format: ClockFormat): void {
    this.clockFormatSignal.set(format);
    localStorage.setItem(CLOCK_FORMAT_KEY, format);
  }

  setCalendarFormat(format: CalendarFormat): void {
    this.calendarFormatSignal.set(format);
    localStorage.setItem(CALENDAR_FORMAT_KEY, format);
  }

  formatDateTime(value: Date | string): string {
    const date = this.parseDate(value);
    if (!Number.isFinite(date.getTime())) {
      return '';
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).padStart(4, '0');
    const dateText =
      this.calendarFormat() === 'dd-mm-yyyy'
        ? `${day}-${month}-${year}`
        : `${month}-${day}-${year}`;

    return `${dateText} ${this.formatTime(date)}`;
  }

  private formatTime(date: Date): string {
    const hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    if (this.clockFormat() === '24h') {
      return `${String(hours).padStart(2, '0')}:${minutes}`;
    }

    const twelveHour = hours % 12 || 12;
    return `${String(twelveHour).padStart(2, '0')}:${minutes} ${hours < 12 ? 'AM' : 'PM'}`;
  }

  private parseDate(value: Date | string): Date {
    if (value instanceof Date) {
      return value;
    }

    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
    if (dateOnly) {
      return new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3]));
    }

    return new Date(value);
  }

  private readClockFormat(): ClockFormat {
    return localStorage.getItem(CLOCK_FORMAT_KEY) === '24h' ? '24h' : '12h';
  }

  private readCalendarFormat(): CalendarFormat {
    return localStorage.getItem(CALENDAR_FORMAT_KEY) === 'mm-dd-yyyy'
      ? 'mm-dd-yyyy'
      : 'dd-mm-yyyy';
  }
}
