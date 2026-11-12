import { Component, inject, signal } from '@angular/core';
import { BreakpointObserver } from '@angular/cdk/layout';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { FeatureToggleService } from '../../shared/services/feature-toggle.service';
import { UnsavedChangesDialogService, type CanDeactivatePage } from '../../shared/components/unsaved-changes-dialog/unsaved-changes-dialog.component';

@Component({
  selector: 'app-settings-wrapper',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatListModule, MatSidenavModule, MatTooltipModule, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './settings-wrapper.html',
  styleUrl: './settings-wrapper.scss',
})
export class SettingsWrapper {
  readonly mockDriverEnabled = inject(FeatureToggleService).mockDriverEnabled;
  private readonly router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private readonly unsavedChangesDialog = inject(UnsavedChangesDialogService);
  readonly isMobile = signal(false);
  mobileSidebarOpen = false;
  isSidebarMinimized = false;
  currentPage = this.getCurrentPage();

  constructor() {
    this.breakpointObserver
      .observe('(max-width: 600px)')
      .pipe(takeUntilDestroyed())
      .subscribe(({ matches }) => {
        this.isMobile.set(matches);
        this.mobileSidebarOpen = false;
      });
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => (this.currentPage = this.getCurrentPage()));
  }

  private getCurrentPage(): string {
    const page = this.router.url.split(/[?#]/, 1)[0].split('/').filter(Boolean).at(-1) ?? 'overview';
    const pageLabels: Record<string, string> = {
      announcements: 'Announcement settings',
      branding: 'Branding',
      'feature-toggles': 'Feature toggles',
      language: 'Language',
      'mock-driver': 'Mock data driver',
      notifications: 'Notifications',
      overview: 'Overview',
      theme: 'Theme',
      time: 'Date & time',
    };
    return pageLabels[page] ?? 'Overview';
  }

  toggleSidebar(): void {
    if (this.isMobile()) {
      this.mobileSidebarOpen = !this.mobileSidebarOpen;
      return;
    }
    this.isSidebarMinimized = !this.isSidebarMinimized;
  }

  closeMobileSidebar(): void {
    if (this.isMobile()) this.mobileSidebarOpen = false;
  }

  registerActivePage(component: CanDeactivatePage): void {
    this.unsavedChangesDialog.registerActivePage(component);
  }

  unregisterActivePage(component: CanDeactivatePage): void {
    this.unsavedChangesDialog.unregisterActivePage(component);
  }
}
