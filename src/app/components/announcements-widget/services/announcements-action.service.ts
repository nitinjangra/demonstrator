import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, take } from 'rxjs';
import { AnnouncementsApiService } from './announcements-api.service';
import type { Announcement } from '../../../shared/interfaces/announcement.interface';

@Injectable({
  providedIn: 'root',
})
export class AnnouncementsActionService {
  private readonly announcementsApiService = inject(AnnouncementsApiService);
  private readonly announcementsSubject = new BehaviorSubject<Announcement[]>([]);

  constructor() {
    this.announcementsApiService
      .getAnnouncements()
      .pipe(take(1))
      .subscribe((announcements) => this.announcementsSubject.next(announcements));
  }

  getAnnouncements(): Observable<Announcement[]> {
    return this.announcementsSubject.pipe(
      map((announcements) => announcements.filter((announcement) => this.isActive(announcement))),
    );
  }

  addAnnouncement(
    announcement: Omit<Announcement, 'id' | 'attachmentUrl' | 'attachmentName'> & {
      attachment?: File;
    },
  ): void {
    const { attachment, ...fields } = announcement;
    const attachmentUrl = attachment ? URL.createObjectURL(attachment) : undefined;

    this.announcementsSubject.next([
      ...this.announcementsSubject.value,
      {
        ...fields,
        id: crypto.randomUUID(),
        status: fields.status ?? 'Draft',
        attachmentUrl,
        attachmentName: attachment?.name,
      },
    ]);
  }

  handleAnnouncementClick(this: void, linkUrl: string): void {
    if (!linkUrl) return;
    window.open(linkUrl, '_blank', 'noopener,noreferrer');
  }

  private isActive(announcement: Announcement): boolean {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const startDate = this.toDate(announcement.startDate);
    const endDate = this.toDate(announcement.endDate);

    return (!startDate || startDate < tomorrow) && (!endDate || endDate >= today);
  }

  private toDate(value: Date | undefined): Date | undefined {
    if (!value) return undefined;
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  }
}
