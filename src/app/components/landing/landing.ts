import { Component, DestroyRef, ElementRef, effect, inject, OnInit, signal, ViewChild } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { AnnouncementsWidgetComponent } from '../announcements-widget/announcements';
import { Hours } from '../../shared/constants/time.const';
import { WeatherIcon } from '../../shared/constants/icon.const';
import { ActionsTableWrapper } from '../actions-table-wrapper/actions-table-wrapper';
import { parsePriorityFilter } from '../actions-table-wrapper/shared/priority-filter';
import type { PriorityFilter } from '../actions-table-wrapper/shared/priority-filter';
import { AgTableStateService } from '../actions-table-wrapper/shared/services/ag-table-state.service';
import { UserSettingsService } from '../../shared/services/user-settings.service';
import type { ActionTableRow } from '../../shared/interfaces/actions-table.interface';
import { LoadingComponent } from '../../shared/components/loading/loading.component';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [AnnouncementsWidgetComponent, ActionsTableWrapper, LoadingComponent, MatIconModule, MatNativeDateModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss'],
})
export class Landing implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly liveAnnouncer = inject(LiveAnnouncer);
  private readonly tableState = inject(AgTableStateService);
  readonly userName = inject(UserSettingsService).firstName;
  readonly actionCount = toSignal(this.tableState.getRowData(), { initialValue: [] as ActionTableRow[] });
  private highlightTimeout?: ReturnType<typeof setTimeout>;
  private pendingHighlightCleanup: { priority: PriorityFilter } | null = null;
  private pendingActionsFocus = false;
  private actionsHeadingElement?: HTMLElement;
  readonly highlightActions = signal(false);
  readonly showLoading = signal(false);

  timeGreeting = '';
  greetingIcon = '';
  get greetingIconData(): string {
    return this.greetingIcon;
  }
  get timeGreetingData(): string {
    return this.timeGreeting;
  }

  constructor() {
    effect((onCleanup) => {
      if (this.tableState.loadStatus() !== 'loading') {
        this.showLoading.set(false);
        return;
      }

      const timer = setTimeout(() => this.showLoading.set(true), 300);
      onCleanup(() => clearTimeout(timer));
    });
  }

  @ViewChild('actionsHeading', { read: ElementRef })
  set actionsHeading(ref: ElementRef<HTMLHeadingElement> | undefined) {
    this.actionsHeadingElement = ref?.nativeElement;
    if (this.pendingActionsFocus && this.actionsHeadingElement) {
      this.pendingActionsFocus = false;
      this.focusActionsHeading();
    }
  }

  ngOnInit(): void {
    this.timeGreeting = this.getGreeting();
    this.destroyRef.onDestroy(() => {
      if (this.highlightTimeout) clearTimeout(this.highlightTimeout);
    });
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const priority = parsePriorityFilter(params.get('priority'));
      const isHighlightCleanup =
        this.pendingHighlightCleanup !== null &&
        !params.has('highlightActions') &&
        priority === this.pendingHighlightCleanup.priority;
      if (isHighlightCleanup) {
        this.pendingHighlightCleanup = null;
        return;
      }

      const highlightRequested = params.get('highlightActions') === 'true' || priority !== null;
      if (!highlightRequested) return;

      this.highlightActions.set(true);
      this.focusActionsHeading();
      void this.liveAnnouncer.announce(
        priority === 'none'
          ? 'Actions filtered to items with no priority.'
          : priority
            ? `Actions filtered by ${priority.toLowerCase()} priority.`
            : 'Actions section opened. All priorities are shown.',
        'polite',
      );
      if (this.highlightTimeout) clearTimeout(this.highlightTimeout);
      this.highlightTimeout = setTimeout(() => this.highlightActions.set(false), 2000);
      if (params.has('highlightActions')) {
        const cleanupRequest = { priority };
        this.pendingHighlightCleanup = cleanupRequest;
        void this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { highlightActions: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        }).then((navigated) => {
          if (!navigated && this.pendingHighlightCleanup === cleanupRequest) {
            this.pendingHighlightCleanup = null;
          }
        });
      }
    });
  }

  private focusActionsHeading(): void {
    if (!this.actionsHeadingElement) {
      this.pendingActionsFocus = true;
      return;
    }

    this.actionsHeadingElement.focus({ preventScroll: true });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < Hours.Twelve) {
      this.greetingIcon = WeatherIcon.Sun;
      return 'Good morning';
    }
    if (hour < Hours.Seventeen) {
      this.greetingIcon = WeatherIcon.Cloud;
      return 'Good afternoon';
    }
    this.greetingIcon = WeatherIcon.Moon;
    return 'Good evening';
  }
}
