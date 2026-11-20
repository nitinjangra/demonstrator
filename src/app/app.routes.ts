import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { FeatureToggleService } from './shared/services/feature-toggle.service';
import { UserSettingsService } from './shared/services/user-settings.service';
import {
  UnsavedChangesDialogService,
  type CanDeactivatePage,
} from './shared/components/unsaved-changes-dialog/unsaved-changes-dialog.component';

const confirmUnsavedChanges = (component: CanDeactivatePage) =>
  inject(UnsavedChangesDialogService).confirmCanDeactivate(component);

// These routes belong to a static demo. The local profile guard only shapes the demo UI;
// it must never be treated as authorization for protected data or operations.

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'landing',
  },
  {
    path: 'dashboard',
    canMatch: [
      () =>
        inject(FeatureToggleService).dashboardEnabled() ||
        inject(Router).createUrlTree(['/landing']),
      () => inject(UserSettingsService).isAdmin() || inject(Router).createUrlTree(['/landing']),
    ],
    loadComponent: () => import('./components/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'landing',
    loadComponent: () => import('./components/landing/landing').then((m) => m.Landing),
  },
  {
    path: 'settings',
    canMatch: [
      () => inject(UserSettingsService).isAdmin() || inject(Router).createUrlTree(['/landing']),
    ],
    loadComponent: () =>
      import('./components/settings/settings-wrapper').then((m) => m.SettingsWrapper),
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'overview',
      },
      {
        path: 'overview',
        loadComponent: () =>
          import('./components/settings/pages/settings-overview/settings-overview').then(
            (m) => m.SettingsOverview,
          ),
      },
      {
        path: 'announcements',
        canDeactivate: [confirmUnsavedChanges],
        loadComponent: () =>
          import('./components/settings/pages/announcements/announcement-settings').then(
            (m) => m.AnnouncementSettings,
          ),
      },
      {
        path: 'general',
        children: [
          { path: '', pathMatch: 'full', redirectTo: 'time' },
          {
            path: 'branding',
            canDeactivate: [confirmUnsavedChanges],
            loadComponent: () =>
              import('./components/settings/pages/branding/branding').then((m) => m.Branding),
          },
          {
            path: 'time',
            canDeactivate: [confirmUnsavedChanges],
            loadComponent: () =>
              import('./components/settings/pages/time-setting/time-setting').then(
                (m) => m.TimeSetting,
              ),
          },
          {
            path: 'theme',
            canDeactivate: [confirmUnsavedChanges],
            loadComponent: () =>
              import('./components/settings/pages/theme-setting/theme-setting').then(
                (m) => m.ThemeSetting,
              ),
          },
          {
            path: 'language',
            loadComponent: () =>
              import('./components/settings/pages/language-setting/language-setting').then(
                (m) => m.LanguageSetting,
              ),
          },
          {
            path: 'feature-toggles',
            canDeactivate: [confirmUnsavedChanges],
            loadComponent: () =>
              import('./components/settings/pages/feature-toggles/feature-toggles').then(
                (m) => m.FeatureToggles,
              ),
          },
          {
            path: 'mock-driver',
            canDeactivate: [confirmUnsavedChanges],
            canMatch: [
              () =>
                inject(FeatureToggleService).mockDriverEnabled() ||
                inject(Router).createUrlTree(['/settings/general/feature-toggles']),
            ],
            loadComponent: () =>
              import('./components/settings/pages/mock-driver/mock-driver').then(
                (m) => m.MockDriver,
              ),
          },
          {
            path: 'notifications',
            canDeactivate: [confirmUnsavedChanges],
            loadComponent: () =>
              import('./components/settings/pages/notifications/notifications').then(
                (m) => m.Notifications,
              ),
          },
        ],
      },
    ],
  },
  {
    path: '**',
    pathMatch: 'full',
    redirectTo: 'landing',
  },
];
