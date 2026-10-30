import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, take } from 'rxjs';
import { AnnouncementsApiService } from './announcements-api.service';
import type { Announcement } from '../../../shared/interfaces/announcement.interface';

export function filterAnnouncementsForDisplay(
  announcements: Announcement[],
  now = new Date(),
): Announcement[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return announcements.filter((announcement) => {
    if (announcement.status !== 'Published') return false;

    const endDate = toDate(announcement.endDate);
    return !endDate || endDate >= today;
  });
}

function toDate(value: Date | undefined): Date | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

@Injectable({
  providedIn: 'root',
})
export class AnnouncementsActionService {
  static readonly maxAnnouncements = 10;
  private static readonly storageKey = 'announcements';
  private readonly announcementsApiService = inject(AnnouncementsApiService);
  private readonly announcementsSubject = new BehaviorSubject<Announcement[]>([]);

  constructor() {
    this.announcementsApiService
      .getAnnouncements()
      .pipe(take(1))
      .subscribe((announcements) => this.announcementsSubject.next(this.readSavedAnnouncements() ?? announcements));
  }

  getAnnouncements(): Observable<Announcement[]> {
    return this.announcementsSubject.pipe(
      map((announcements) => filterAnnouncementsForDisplay(announcements)),
    );
  }

  getAllAnnouncements(): Observable<Announcement[]> {
    return this.announcementsSubject.asObservable();
  }

  get canAddAnnouncement(): boolean {
    return this.announcementsSubject.value.length < AnnouncementsActionService.maxAnnouncements;
  }

  saveAnnouncements(announcements: Announcement[]): void {
    this.announcementsSubject.next(announcements);
    this.persistAnnouncements();
  }

  addAnnouncement(
    announcement: Omit<Announcement, 'id' | 'attachmentUrl' | 'attachmentName'> & {
      attachment?: File;
    },
  ): boolean {
    if (!this.canAddAnnouncement) return false;

    const { attachment, ...fields } = announcement;
    const attachmentUrl = attachment ? URL.createObjectURL(attachment) : undefined;

    this.announcementsSubject.next([
      ...this.announcementsSubject.value,
      {
        ...fields,
        id: crypto.randomUUID(),
        status: fields.status,
        attachmentUrl,
        attachmentName: attachment?.name,
      },
    ]);
    this.persistAnnouncements();
    return true;
  }

  handleAnnouncementClick(this: void, linkUrl: string): void {
    if (!linkUrl) return;
    window.open(linkUrl, '_blank', 'noopener,noreferrer');
  }

  private toDate(value: Date | undefined): Date | undefined {
    return toDate(value);
  }

  private readSavedAnnouncements(): Announcement[] | undefined {
    const saved = localStorage.getItem(AnnouncementsActionService.storageKey);
    if (!saved) return undefined;

    try {
      return (JSON.parse(saved) as Announcement[]).map((announcement) => ({
        ...announcement,
        startDate: this.toDate(announcement.startDate),
        endDate: this.toDate(announcement.endDate),
      }));
    } catch {
      return undefined;
    }
  }

  private persistAnnouncements(): void {
    localStorage.setItem(
      AnnouncementsActionService.storageKey,
      JSON.stringify(this.announcementsSubject.value),
    );
  }
}
