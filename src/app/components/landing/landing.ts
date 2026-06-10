import { Component, OnInit } from '@angular/core';
import { Announcements } from '../announcements-widget/announcements';
import { Hours } from '../../shared/constants/time.const';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [Announcements],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss'],
})
export class Landing implements OnInit {
  timeGreeting = '';
  greetingIcon = '';
  ngOnInit(): void {
    this.timeGreeting = this.getGreeting();
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < Hours.Tweleve) {
      this.greetingIcon = '☀️';
      return 'Good Morning!!';
    }
    if (hour < Hours.Seventeen) {
      this.greetingIcon = '🌤️';
      return 'Good Afternoon!!';
    }
    this.greetingIcon = '🌙';
    return 'Good Evening!!';
  }
}
