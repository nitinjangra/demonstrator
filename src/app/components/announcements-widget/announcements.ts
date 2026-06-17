import { Component, inject, OnInit } from '@angular/core';
import { AnnouncementsApiService } from './services/announcements-api.service';
import { Announcement } from '../../shared/announcement.interface';
import { Observable, of } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [AsyncPipe],
  providers: [AnnouncementsApiService],
  templateUrl: './announcements.html',
  styleUrl: './announcements.scss',
})
export class Announcements implements OnInit {
  announcements: Observable<Announcement[]> = of([]);
  private readonly announcementsApiService = inject(AnnouncementsApiService);

  ngOnInit(): void {
    this.announcements = this.announcementsApiService.getAnnouncements();
  }
  handleAnnouncementClick(linkUrl: string): void {
    window.open(linkUrl, '_blank', 'noopener,noreferrer');
  }
}
