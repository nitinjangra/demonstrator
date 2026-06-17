import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { mockAnnouncements } from '../../../shared/mocks/mock-announcements';
import { Announcement } from '../../../shared/interfaces/announcement.interface';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementsApiService {
  getAnnouncements(this: void): Observable<Announcement[]> {
    return of(mockAnnouncements);
  }
}
