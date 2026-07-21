import { Component, OnInit } from '@angular/core';
import { AnnouncementsWidgetComponent } from '../announcements-widget/announcements';
import { Hours } from '../../shared/constants/time.const';
import { WeatherIcon } from '../../shared/constants/icon.const';
import { ActionsTableWrapper } from '../actions-table-wrapper/actions-table-wrapper';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [AnnouncementsWidgetComponent,ActionsTableWrapper],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss'],
})
export class Landing implements OnInit {
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
