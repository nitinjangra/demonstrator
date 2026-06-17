import { Component, inject, OnInit } from '@angular/core';
import { Announcement } from '../../shared/interfaces/announcement.interface';
import { Observable, of } from 'rxjs';
import { AsyncPipe } from '@angular/common';
import { AnnouncementsActionService } from './services/announcements-action.service';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './announcements.html',
  styleUrls: ['./announcements.scss'],
})
export class AnnouncementsWidgetComponent implements OnInit {
  announcements: Observable<Announcement[]> = of([]);
  private readonly announcementsActionService = inject(AnnouncementsActionService);

  ngOnInit(): void {
    this.announcements = this.announcementsActionService.getAnnouncements();
  }
  handleAnnouncementClick(linkUrl: string): void {
    if (!linkUrl) return;
    this.announcementsActionService.handleAnnouncementClick(linkUrl);
  }

  trackByAnnouncement(index: number, announcement: Announcement): string {
    return announcement.id;
  }
}
