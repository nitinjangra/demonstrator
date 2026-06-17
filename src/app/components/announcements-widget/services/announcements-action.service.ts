import { inject, Injectable } from '@angular/core';
import { AnnouncementsApiService } from './announcements-api.service';
import { Observable } from 'rxjs';
import { Announcement } from '../../../shared/interfaces/announcement.interface';
@Injectable({
  providedIn: 'root',
})
export class AnnouncementsActionService {
  private readonly announcementsApiService = inject(AnnouncementsApiService);

  getAnnouncements(): Observable<Announcement[]> {
    return this.announcementsApiService.getAnnouncements();
  }

  handleAnnouncementClick(this: void, linkUrl: string): void {
    if (!linkUrl) return;
    window.open(linkUrl, '_blank', 'noopener,noreferrer');
  }
}
