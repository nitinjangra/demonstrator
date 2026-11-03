import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { AnnouncementsWidgetComponent } from '../announcements-widget/announcements';
import { Hours } from '../../shared/constants/time.const';
import { WeatherIcon } from '../../shared/constants/icon.const';
import { ActionsTableWrapper } from '../actions-table-wrapper/actions-table-wrapper';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [AnnouncementsWidgetComponent, ActionsTableWrapper, MatIconModule, MatNativeDateModule],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss'],
})
export class Landing implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private highlightTimeout?: ReturnType<typeof setTimeout>;
  highlightActions = false;
  timeGreeting = '';
  greetingIcon = '';
  get greetingIconData(): string {
    return this.greetingIcon;
  }
  get timeGreetingData(): string {
    return this.timeGreeting;
  }

  ngOnInit(): void {
    this.timeGreeting = this.getGreeting();
    this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      const highlightRequested =
        params.get('highlightActions') === 'true' || params.has('priority');
      if (!highlightRequested) return;

      this.highlightActions = true;
      if (this.highlightTimeout) clearTimeout(this.highlightTimeout);
      this.highlightTimeout = setTimeout(() => (this.highlightActions = false), 2000);
      if (params.has('highlightActions')) {
        void this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { highlightActions: null },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
      this.destroyRef.onDestroy(() => {
        if (this.highlightTimeout) clearTimeout(this.highlightTimeout);
      });
    });
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < Hours.Twelve) {
      this.greetingIcon = WeatherIcon.Sun;
      return 'Good Morning!!';
    }
    if (hour < Hours.Seventeen) {
      this.greetingIcon = WeatherIcon.Cloud;
      return 'Good Afternoon!!';
    }
    this.greetingIcon = WeatherIcon.Moon;
    return 'Good Evening!!';
  }
}
