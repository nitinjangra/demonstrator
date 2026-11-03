import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import type { CanMatchFn } from '@angular/router';
import { FeatureToggleService } from './shared/services/feature-toggle.service';
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
});
