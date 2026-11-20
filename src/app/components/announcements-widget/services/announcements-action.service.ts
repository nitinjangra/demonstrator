import { inject, Injectable, signal } from '@angular/core';
import { BehaviorSubject, catchError, EMPTY, map, Observable, take, tap } from 'rxjs';
import { AnnouncementsApiService } from './announcements-api.service';
import type {
  Announcement,
  AnnouncementStatus,
} from '../../../shared/interfaces/announcement.interface';

export type AnnouncementSaveIntent = 'draft' | 'publish';

function asDate(value: Date | string | undefined): Date | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function deriveAnnouncementStatus(
  startDate: Date | string | undefined,
  endDate: Date | string | undefined,
  fallbackStatus: AnnouncementStatus = 'Draft',
  now = new Date(),
): AnnouncementStatus {
  const start = asDate(startDate);
  const end = asDate(endDate);
  if (!start && !end) return fallbackStatus;

  const today = startOfDay(now).getTime();
  if (end && startOfDay(end).getTime() < today) return 'Expired';
  if (start && startOfDay(start).getTime() > today) return 'Scheduled';
  return 'Published';
}

export function resolveAnnouncementStatus(
  startDate: Date | string | undefined,
  endDate: Date | string | undefined,
  intent: AnnouncementSaveIntent | undefined,
  fallbackStatus: AnnouncementStatus = 'Draft',
  now = new Date(),
): AnnouncementStatus {
  if (intent === 'draft') return 'Draft';
  return deriveAnnouncementStatus(
    startDate,
    endDate,
    intent === 'publish' ? 'Published' : fallbackStatus,
    now,
  );
}

export function filterAnnouncementsForDisplay(
  announcements: Announcement[],
  now = new Date(),
): Announcement[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return announcements.filter((announcement) => {
    if (announcement.status !== 'Published') return false;

    const startDate = toDate(announcement.startDate);
    const endDate = toDate(announcement.endDate);
    return (
      (!startDate || startOfDay(startDate).getTime() <= today.getTime()) &&
      (!endDate || startOfDay(endDate).getTime() >= today.getTime())
    );
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
  readonly loadStatus = signal<'loading' | 'loaded' | 'refreshing' | 'error'>('loading');

  constructor() {
    this.loadAnnouncements();
  }

  loadAnnouncements(): void {
    const alreadyLoaded =
      this.loadStatus() === 'loaded' ||
      (this.loadStatus() === 'error' && this.announcementsSubject.value.length > 0);
    this.loadStatus.set(alreadyLoaded ? 'refreshing' : 'loading');
    this.announcementsApiService
      .getAnnouncements()
      .pipe(
        take(1),
        tap((announcements) => {
          this.announcementsSubject.next(this.readSavedAnnouncements() ?? announcements);
          this.loadStatus.set('loaded');
        }),
        catchError(() => {
          this.loadStatus.set('error');
          return EMPTY;
        }),
      )
      .subscribe();
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
    this.announcementsSubject.next(
      announcements.map((announcement) => ({
        ...announcement,
        status:
          announcement.status === 'Draft'
            ? 'Draft'
            : this.getStatusForDates(
                announcement.startDate,
                announcement.endDate,
                announcement.status,
              ),
      })),
    );
    this.persistAnnouncements();
  }

  getStatusForDates(
    startDate: Date | undefined,
    endDate: Date | undefined,
    fallbackStatus: AnnouncementStatus = 'Draft',
  ): AnnouncementStatus {
    return deriveAnnouncementStatus(startDate, endDate, fallbackStatus);
  }

  addAnnouncement(
    announcement: Omit<Announcement, 'id' | 'attachmentUrl' | 'attachmentName'> & {
      attachment?: File;
      intent?: AnnouncementSaveIntent;
      removeAttachment?: boolean;
    },
  ): boolean {
    if (!this.canAddAnnouncement) return false;

    const { attachment, intent } = announcement;
    const fields = { ...announcement };
    delete fields.attachment;
    delete fields.intent;
    delete fields.removeAttachment;
    const attachmentUrl = attachment ? URL.createObjectURL(attachment) : undefined;

    this.announcementsSubject.next([
      ...this.announcementsSubject.value,
      {
        ...fields,
        id: crypto.randomUUID(),
        status: resolveAnnouncementStatus(fields.startDate, fields.endDate, intent, fields.status),
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
      return (JSON.parse(saved) as Announcement[]).map((announcement) => {
        const startDate = this.toDate(announcement.startDate);
        const endDate = this.toDate(announcement.endDate);
        return {
          ...announcement,
          startDate,
          endDate,
          status:
            announcement.status === 'Draft'
              ? 'Draft'
              : this.getStatusForDates(startDate, endDate, announcement.status ?? 'Draft'),
        };
      });
    } catch {
      return undefined;
    }
  }

  private persistAnnouncements(): void {
    localStorage.setItem(
      AnnouncementsActionService.storageKey,
      JSON.stringify(
        this.announcementsSubject.value.map(({ attachmentUrl, attachmentName, ...announcement }) =>
          attachmentUrl?.startsWith('blob:')
            ? announcement
            : { ...announcement, attachmentUrl, attachmentName },
        ),
      ),
    );
  }
}
