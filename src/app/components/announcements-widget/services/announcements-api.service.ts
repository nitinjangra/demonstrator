import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { mockAnnouncements } from '../../../shared/mocks/mock-announcements';
import { Announcement } from '../../../shared/announcement.interface';

@Injectable()
export class AnnouncementsApiService {

  getAnnouncements(): Observable<Announcement[]> {
    return of(mockAnnouncements);
  }
}
