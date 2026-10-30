import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-settings-overview',
  standalone: true,
  imports: [MatIconModule, RouterLink],
  template: `
    <section class="settings-overview" aria-labelledby="settings-overview-title">
      <h2 id="settings-overview-title">Settings overview</h2>
      <nav aria-label="Settings areas">
        <a class="settings-overview-row" routerLink="/settings/general/branding">
          <span>
            <strong>Branding</strong>
            <small>Customize your application's identity.</small>
          </span>
          <mat-icon aria-hidden="true">arrow_forward</mat-icon>
        </a>
        <a class="settings-overview-row" routerLink="/settings/general/feature-toggles">
          <span>
            <strong>Feature Toggles</strong>
            <small>Enable or disable application features.</small>
          </span>
          <mat-icon aria-hidden="true">arrow_forward</mat-icon>
        </a>
        <a class="settings-overview-row" routerLink="/settings/general/notifications">
          <span>
            <strong>Notifications</strong>
            <small>Configure notification preferences.</small>
          </span>
          <mat-icon aria-hidden="true">arrow_forward</mat-icon>
        </a>
        <a class="settings-overview-row" routerLink="/settings/announcements">
          <span>
            <strong>Announcement Settings</strong>
            <small>Manage application announcements.</small>
          </span>
          <mat-icon aria-hidden="true">arrow_forward</mat-icon>
        </a>
      </nav>
    </section>
  `,
  styles: `
    .settings-overview { max-width: 64rem; }
    .settings-overview h2 { margin: 0 0 1rem; }
    nav { display: grid; }
    .settings-overview-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      min-height: 4.5rem;
      padding: 0.75rem 0.5rem;
      border-bottom: 1px solid var(--color-border, #d9dce1);
      color: inherit;
      text-decoration: none;
    }
    .settings-overview-row:first-child { border-top: 1px solid var(--color-border, #d9dce1); }
    .settings-overview-row:hover { background: color-mix(in srgb, var(--color-primary, #3f51b5) 8%, transparent); }
    .settings-overview-row:focus-visible { outline: 2px solid var(--color-primary, #3f51b5); outline-offset: 2px; }
    .settings-overview-row > span { display: grid; gap: 0.25rem; }
    .settings-overview-row small { color: var(--color-text-muted, #697386); }
    .settings-overview-row mat-icon { color: var(--color-primary, #3f51b5); }
  `,
})
export class SettingsOverview {}
