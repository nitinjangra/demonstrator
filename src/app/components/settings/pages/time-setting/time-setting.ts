import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { StickyFooterComponent } from '../../../../shared/components/sticky-footer/sticky-footer.component';
import {
  CalendarFormat,
  ClockFormat,
  DateTimeSettingsService,
} from '../../../../shared/services/date-time-settings.service';

@Component({
  selector: 'app-time-setting',
  standalone: true,
  imports: [MatButtonModule, MatButtonToggleModule, StickyFooterComponent],
  template: `
    <section class="time-settings" aria-labelledby="time-setting-title">
      <h2 id="time-setting-title">Time setting</h2>
      <p>Choose how dates and times are displayed in action tables.</p>

      <div class="setting-group">
        <h3 id="clock-format-label">Time format</h3>
        <mat-button-toggle-group
          aria-labelledby="clock-format-label"
          [value]="draftClockFormat()"
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
          [value]="draftCalendarFormat()"
          (change)="setCalendarFormat($event.value)"
        >
          <mat-button-toggle value="dd-mm-yyyy">DD-MM-YYYY</mat-button-toggle>
          <mat-button-toggle value="mm-dd-yyyy">MM-DD-YYYY</mat-button-toggle>
        </mat-button-toggle-group>
      </div>
    </section>
    <app-sticky-footer [fixed]="false">
      <button matButton="filled" type="button" [disabled]="!hasUnsavedChanges()" (click)="saveChanges()">
        Save changes
      </button>
    </app-sticky-footer>
  `,
  styles: `
    :host {
      display: flex;
      min-height: 100%;
      flex-direction: column;
    }

    .time-settings {
      display: grid;
      align-content: start;
      flex: 1;
      gap: 1.25rem;
      width: 100%;
    }

    .setting-group {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      width: 100%;
    }

    .setting-group h3 {
      margin: 0;
      font-size: 1rem;
    }

    .setting-group mat-button-toggle-group {
      flex: 0 0 auto;
      margin-left: auto;
    }

    app-sticky-footer {
      margin-top: auto;
    }

    @media (max-width: 700px) {
      .setting-group {
        align-items: flex-start;
        flex-direction: column;
      }

      .setting-group mat-button-toggle-group {
        max-width: 100%;
        margin-left: 0;
      }
    }
  `,
})
export class TimeSetting {
  private readonly settings = inject(DateTimeSettingsService);
  readonly clockFormat = this.settings.clockFormat;
  readonly calendarFormat = this.settings.calendarFormat;
  readonly draftClockFormat = signal(this.clockFormat());
  readonly draftCalendarFormat = signal(this.calendarFormat());
  readonly hasUnsavedChanges = computed(
    () =>
      this.draftClockFormat() !== this.clockFormat() ||
      this.draftCalendarFormat() !== this.calendarFormat(),
  );

  setClockFormat(format: ClockFormat): void {
    this.draftClockFormat.set(format);
  }

  setCalendarFormat(format: CalendarFormat): void {
    this.draftCalendarFormat.set(format);
  }

  saveChanges(): void {
    this.settings.setClockFormat(this.draftClockFormat());
    this.settings.setCalendarFormat(this.draftCalendarFormat());
  }
}
