import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import type { CanDeactivateFn, CanMatchFn } from '@angular/router';
import { FeatureToggleService } from './shared/services/feature-toggle.service';
import { UserSettingsService } from './shared/services/user-settings.service';
import { routes } from './app.routes';

describe('routes', () => {
  it('allows dashboard matching when the dashboard feature is enabled', () => {
    const featureToggles = { dashboardEnabled: () => true };
    TestBed.configureTestingModule({
      providers: [{ provide: FeatureToggleService, useValue: featureToggles }],
    });

    const guard = routes.find(({ path }) => path === 'dashboard')?.canMatch?.[0] as CanMatchFn;
    expect(guard).toBeTruthy();
    expect(TestBed.runInInjectionContext(() => guard!(null as never, [], {} as never))).toBeTrue();
  });

  it('redirects dashboard matching to landing when the feature is disabled', () => {
    const featureToggles = { dashboardEnabled: () => false };
    const router = { createUrlTree: jasmine.createSpy().and.returnValue({ redirect: true }) };
    TestBed.configureTestingModule({
      providers: [
        { provide: FeatureToggleService, useValue: featureToggles },
        { provide: Router, useValue: router },
      ],
    });

    const guard = routes.find(({ path }) => path === 'dashboard')?.canMatch?.[0] as CanMatchFn;
    const result = TestBed.runInInjectionContext(() => guard!(null as never, [], {} as never));

    expect(result).toEqual({ redirect: true } as unknown as UrlTree);
    expect(router.createUrlTree).toHaveBeenCalledOnceWith(['/landing']);
  });

  it('matches dashboard when feature and admin access are enabled', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: FeatureToggleService, useValue: { dashboardEnabled: () => true } },
        { provide: UserSettingsService, useValue: { isAdmin: () => true } },
      ],
    });
    const guard = routes.find(({ path }) => path === 'dashboard')?.canMatch?.[1] as CanMatchFn;
    expect(TestBed.runInInjectionContext(() => guard(null as never, [], {} as never))).toBeTrue();
  });

  it('redirects dashboard and settings for standard users', () => {
    const router = { createUrlTree: jasmine.createSpy().and.returnValue({ redirect: true }) };
    TestBed.configureTestingModule({
      providers: [
        { provide: UserSettingsService, useValue: { isAdmin: () => false } },
        { provide: Router, useValue: router },
      ],
    });
    const dashboardGuard = routes.find(({ path }) => path === 'dashboard')?.canMatch?.[1] as CanMatchFn;
    const settingsGuard = routes.find(({ path }) => path === 'settings')?.canMatch?.[0] as CanMatchFn;
    expect(TestBed.runInInjectionContext(() => dashboardGuard(null as never, [], {} as never))).toEqual({ redirect: true } as unknown as UrlTree);
    expect(TestBed.runInInjectionContext(() => settingsGuard(null as never, [], {} as never))).toEqual({ redirect: true } as unknown as UrlTree);
    expect(router.createUrlTree).toHaveBeenCalledTimes(2);
  });

  it('invokes settings route guards', () => {
    const settings = routes.find(({ path }) => path === 'settings')!;
    const children = settings.children!;
    const guard = children.find(({ path }) => path === 'announcements')!.canDeactivate![0] as CanDeactivateFn<{
      canDeactivate: () => boolean;
    }>;
    expect(guard({ canDeactivate: () => true } as never, {} as never, {} as never, {} as never)).toBeTrue();
    expect(guard({ canDeactivate: () => false } as never, {} as never, {} as never, {} as never)).toBeFalse();
  });


  it('protects the mock driver with its feature toggle', () => {
    const general = routes.find(({ path }) => path === 'settings')!.children!.find(({ path }) => path === 'general')!;
    const guard = general.children!.find(({ path }) => path === 'mock-driver')!.canMatch![0] as CanMatchFn;
    const router = { createUrlTree: jasmine.createSpy().and.returnValue({ redirect: true }) };
    TestBed.configureTestingModule({ providers: [
      { provide: FeatureToggleService, useValue: { mockDriverEnabled: () => true } },
      { provide: Router, useValue: router },
    ] });
    expect(TestBed.runInInjectionContext(() => guard(null as never, [], {} as never))).toBeTrue();
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({ providers: [
      { provide: FeatureToggleService, useValue: { mockDriverEnabled: () => false } },
      { provide: Router, useValue: router },
    ] });
    expect(TestBed.runInInjectionContext(() => guard(null as never, [], {} as never))).toEqual({ redirect: true } as unknown as UrlTree);
  });
});
