import { inject } from '@angular/core';
import { Router, Routes } from '@angular/router';
import { FeatureToggleService } from './shared/services/feature-toggle.service';

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
    ],
    loadComponent: () => import('./components/dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'landing',
    loadComponent: () => import('./components/landing/landing').then((m) => m.Landing),
  },
  {
    path: 'settings',
    loadComponent: () => import('./components/settings/settings-wrapper').then((m) => m.SettingsWrapper),
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
            loadComponent: () =>
              import('./components/settings/pages/branding/branding').then((m) => m.Branding),
          },
          {
            path: 'time',
            loadComponent: () =>
              import('./components/settings/pages/time-setting/time-setting').then(
                (m) => m.TimeSetting,
              ),
          },
          {
            path: 'theme',
            loadComponent: () =>
              import('./components/settings/pages/theme-setting/theme-setting').then(
                (m) => m.ThemeSetting,
              ),
          },
          {
            path: 'feature-toggles',
            loadComponent: () =>
              import('./components/settings/pages/feature-toggles/feature-toggles').then((m) => m.FeatureToggles),
          },
          {
            path: 'notifications',
            loadComponent: () =>
              import('./components/settings/pages/notifications/notifications').then((m) => m.Notifications),
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
