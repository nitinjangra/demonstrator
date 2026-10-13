import { Component, inject } from '@angular/core';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import {
  CalendarFormat,
  ClockFormat,
  DateTimeSettingsService,
} from '../../../../shared/services/date-time-settings.service';

@Component({
  selector: 'app-time-setting',
  standalone: true,
  imports: [MatButtonToggleModule],
  template: `
    <section class="time-settings" aria-labelledby="time-setting-title">
      <h2 id="time-setting-title">Time setting</h2>
      <p>Choose how dates and times are displayed in action tables.</p>

      <div class="setting-group">
        <h3 id="clock-format-label">Time format</h3>
        <mat-button-toggle-group
          aria-labelledby="clock-format-label"
          [value]="clockFormat()"
          (change)="setClockFormat($event.value)"
        >
          <mat-button-toggle value="12h">12-hour</mat-button-toggle>
          <mat-button-toggle value="24h">24-hour</mat-button-toggle>
        </mat-button-toggle-group>
      </div>

      <div class="setting-group">
        <h3 id="calendar-format-label">Date format</h3>
        <mat-button-toggle-group
          aria-labelledby="calendar-format-label"
          [value]="calendarFormat()"
          (change)="setCalendarFormat($event.value)"
        >
          <mat-button-toggle value="dd-mm-yyyy">DD-MM-YYYY</mat-button-toggle>
          <mat-button-toggle value="mm-dd-yyyy">MM-DD-YYYY</mat-button-toggle>
        </mat-button-toggle-group>
      </div>
    </section>
  `,
  styles: `
    .time-settings {
      display: grid;
      justify-items: start;
      gap: 1rem;
    }

    .setting-group {
      display: grid;
      gap: 0.5rem;
    }

    .setting-group h3 {
      margin: 0;
      font-size: 1rem;
    }
  `,
})
export class TimeSetting {
  private readonly settings = inject(DateTimeSettingsService);
  readonly clockFormat = this.settings.clockFormat;
  readonly calendarFormat = this.settings.calendarFormat;

  setClockFormat(format: ClockFormat): void {
    this.settings.setClockFormat(format);
  }

  setCalendarFormat(format: CalendarFormat): void {
    this.settings.setCalendarFormat(format);
  }
}
