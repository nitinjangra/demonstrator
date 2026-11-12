import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter, Router } from '@angular/router';
import { DateAdapter } from '@angular/material/core';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { BehaviorSubject } from 'rxjs';

import { Landing } from './landing';
import { WeatherIcon } from '../../shared/constants/icon.const';

describe('Landing', () => {
  let component: Landing;
  let fixture: ComponentFixture<Landing>;
  let queryParams: BehaviorSubject<ReturnType<typeof convertToParamMap>>;

  beforeEach(async () => {
    queryParams = new BehaviorSubject(convertToParamMap({}));
    await TestBed.configureTestingModule({
      imports: [Landing],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: { queryParamMap: queryParams.asObservable() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Landing);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.isPreparing.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('shows loading feedback while the page prepares its content', () => {
    component.isPreparing.set(true);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Getting things ready...');
    expect(fixture.nativeElement.querySelector('#actions-section')).toBeNull();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should provide the native date adapter required by announcement date pickers', () => {
    expect(fixture.debugElement.injector.get(DateAdapter)).toBeTruthy();
  });

  it('briefly highlights the actions section when navigation requests it', () => {
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    jasmine.clock().install();

    fixture.detectChanges();
    queryParams.next(convertToParamMap({ highlightActions: 'true' }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#actions-section')?.classList)
      .toContain('landing-focus-content--highlight');
    expect(fixture.nativeElement.querySelector('main.landing')?.classList)
      .toContain('landing--focus-actions');
    expect(fixture.nativeElement.querySelector('.landing-focus-backdrop')?.getAttribute('aria-hidden'))
      .toBe('true');
    jasmine.clock().tick(2000);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#actions-section')?.classList)
      .not.toContain('landing-focus-content--highlight');
    expect(fixture.nativeElement.querySelector('main.landing')?.classList)
      .not.toContain('landing--focus-actions');
    jasmine.clock().uninstall();
  });

  it('also highlights the actions section when a priority filter is in the route', () => {
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    jasmine.clock().install();

    fixture.detectChanges();
    queryParams.next(convertToParamMap({ priority: 'High' }));
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('#actions-section')?.classList)
      .toContain('landing-focus-content--highlight');
    expect(fixture.nativeElement.querySelector('main.landing')?.classList)
      .toContain('landing--focus-actions');
    jasmine.clock().tick(2000);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#actions-section')?.classList)
      .not.toContain('landing-focus-content--highlight');
    expect(fixture.nativeElement.querySelector('main.landing')?.classList)
      .not.toContain('landing--focus-actions');
    jasmine.clock().uninstall();
  });

  it('moves focus to Actions and announces the applied priority filter', () => {
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    const announce = spyOn(TestBed.inject(LiveAnnouncer), 'announce').and.resolveTo();

    fixture.detectChanges();
    queryParams.next(convertToParamMap({ priority: 'High', tab: 'actions' }));
    fixture.detectChanges();

    expect(document.activeElement).toBe(fixture.nativeElement.querySelector('#actions-heading'));
    expect(announce).toHaveBeenCalledWith('Actions filtered by high priority.', 'polite');
  });

  it('announces when navigation opens the unfiltered actions section', () => {
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    const announce = spyOn(TestBed.inject(LiveAnnouncer), 'announce').and.resolveTo();

    fixture.detectChanges();
    queryParams.next(convertToParamMap({ highlightActions: 'true' }));

    expect(announce).toHaveBeenCalledWith('Actions section opened. All priorities are shown.', 'polite');
  });

  it('preserves priority query parameters when highlight and priority are combined', () => {
    const navigate = spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    const announce = spyOn(TestBed.inject(LiveAnnouncer), 'announce').and.resolveTo();
    jasmine.clock().install();

    fixture.detectChanges();
    queryParams.next(convertToParamMap({ highlightActions: 'true', priority: 'High', tab: 'actions' }));
    fixture.detectChanges();

    expect(component.highlightActions()).toBeTrue();
    expect(navigate).toHaveBeenCalledWith([], jasmine.objectContaining({
      queryParams: { highlightActions: null },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    }));

    queryParams.next(convertToParamMap({ priority: 'High', tab: 'actions' }));
    fixture.detectChanges();
    expect(component.highlightActions()).toBeTrue();
    expect(announce).toHaveBeenCalledTimes(1);

    jasmine.clock().tick(2000);
    fixture.detectChanges();
    expect(component.highlightActions()).toBeFalse();
    jasmine.clock().uninstall();
  });

  it('restarts the highlight duration when another navigation requests it', () => {
    spyOn(TestBed.inject(Router), 'navigate').and.resolveTo(true);
    jasmine.clock().install();

    fixture.detectChanges();
    queryParams.next(convertToParamMap({ highlightActions: 'true' }));
    jasmine.clock().tick(1500);
    queryParams.next(convertToParamMap({ priority: 'Medium' }));
    jasmine.clock().tick(1000);
    fixture.detectChanges();

    expect(component.highlightActions()).toBeTrue();
    jasmine.clock().tick(1000);
    fixture.detectChanges();
    expect(component.highlightActions()).toBeFalse();
    jasmine.clock().uninstall();
  });

  it('should show the morning greeting and sun icon', () => {
    spyOn(Date.prototype, 'getHours').and.returnValue(9);

    fixture.detectChanges();

    component.timeGreeting = component.getGreeting();
    fixture.detectChanges();
    expect(component.timeGreeting).toBe('Good morning');
    expect(component.greetingIcon).toBe(WeatherIcon.Sun);
    expect(fixture.nativeElement.querySelector('h1').textContent).toContain('Good morning');
  });

  it('should show the afternoon greeting and cloud icon', () => {
    spyOn(Date.prototype, 'getHours').and.returnValue(14);

    fixture.detectChanges();

    component.timeGreeting = component.getGreeting();
    fixture.detectChanges();
    expect(component.timeGreeting).toBe('Good afternoon');
    expect(component.greetingIcon).toBe(WeatherIcon.Cloud);
  });

  it('should show the evening greeting and moon icon', () => {
    spyOn(Date.prototype, 'getHours').and.returnValue(18);

    fixture.detectChanges();

    component.timeGreeting = component.getGreeting();
    fixture.detectChanges();
    expect(component.timeGreeting).toBe('Good evening');
    expect(component.greetingIcon).toBe(WeatherIcon.Moon);
  });
});
