import {
  afterEveryRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  OnInit,
  signal,
  viewChildren,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { Observable, filter, map, of, switchMap, take } from 'rxjs';
import { Announcement } from '../../shared/interfaces/announcement.interface';
import { HoldFeedbackDirective } from '../../shared/directives/hold-feedback.directive';
import { CreateAnnouncementDialogComponent } from './create-announcement-dialog/create-announcement-dialog';
import { CreateAnnouncementResult } from './types/create-announcement.types';
import { AnnouncementsActionService } from './services/announcements-action.service';

@Component({
  selector: 'app-announcements',
  standalone: true,
  imports: [
    AsyncPipe,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatMenuModule,
    RouterLink,
    HoldFeedbackDirective,
  ],
  templateUrl: './announcements.html',
  styleUrls: ['./announcements.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnouncementsWidgetComponent implements OnInit {
  private readonly expandedAnnouncementIds = signal<ReadonlySet<string>>(new Set());
  private readonly truncatedAnnouncementIds = signal<ReadonlySet<string>>(new Set());
  private readonly descriptionElements =
    viewChildren<ElementRef<HTMLParagraphElement>>('announcementDescription');
  private readonly observedDescriptions = new Set<HTMLParagraphElement>();
  private readonly resizeObserver = new ResizeObserver(() => this.updateTruncatedDescriptions());

  announcements: Observable<Announcement[]> = of([]);
  private readonly announcementsActionService = inject(AnnouncementsActionService);
  private readonly dialog = inject(MatDialog);
  private readonly attachmentUrls = new Set<string>();

  constructor() {
    afterEveryRender(() => {
      const descriptions = new Set(
        this.descriptionElements().map(({ nativeElement }) => nativeElement),
      );

      for (const element of this.observedDescriptions) {
        if (!descriptions.has(element)) {
          this.resizeObserver.unobserve(element);
          this.observedDescriptions.delete(element);
        }
      }

      for (const element of descriptions) {
        if (!this.observedDescriptions.has(element)) {
          this.resizeObserver.observe(element);
          this.observedDescriptions.add(element);
        }
      }

      this.updateTruncatedDescriptions();
    });

    inject(DestroyRef).onDestroy(() => {
      this.resizeObserver.disconnect();
      for (const attachmentUrl of this.attachmentUrls) {
        URL.revokeObjectURL(attachmentUrl);
      }
    });
  }

  ngOnInit(): void {
    this.announcements = this.announcementsActionService.getAnnouncements();
  }

  openCreateAnnouncementDialog(): void {
    this.dialog
      .open(CreateAnnouncementDialogComponent, {
        width: 'min(32rem, calc(100vw - 2rem))',
      })
      .afterClosed()
      .pipe(
        filter((announcement): announcement is CreateAnnouncementResult => !!announcement),
        switchMap((announcement) =>
          this.announcements.pipe(
            take(1),
            map((currentAnnouncements) => {
              const { attachment, ...announcementFields } = announcement;
              const attachmentUrl = attachment ? URL.createObjectURL(attachment) : undefined;
              if (attachmentUrl) this.attachmentUrls.add(attachmentUrl);

              return [
                ...currentAnnouncements,
                {
                  ...announcementFields,
                  id: crypto.randomUUID(),
                  attachmentUrl,
                  attachmentName: attachment?.name,
                },
              ];
            }),
          ),
        ),
      )
      .subscribe((updatedAnnouncements) => {
        this.announcements = of(updatedAnnouncements);
      });
  }

  handleAnnouncementClick(linkUrl: string): void {
    if (!linkUrl) return;
    this.announcementsActionService.handleAnnouncementClick(linkUrl);
  }

  isExpanded(id: string): boolean {
    return this.expandedAnnouncementIds().has(id);
  }

  isTruncated(id: string): boolean {
    return this.truncatedAnnouncementIds().has(id);
  }

  toggleDescription(id: string): void {
    this.expandedAnnouncementIds.update((expandedIds) => {
      const updatedIds = new Set(expandedIds);
      if (updatedIds.has(id)) {
        updatedIds.delete(id);
      } else {
        updatedIds.add(id);
      }
      return updatedIds;
    });
  }

  private updateTruncatedDescriptions(): void {
    const expandedIds = this.expandedAnnouncementIds();
    const nextTruncatedIds = new Set(this.truncatedAnnouncementIds());
    let changed = false;

    for (const { nativeElement } of this.descriptionElements()) {
      const id = nativeElement.dataset['announcementId'];
      if (!id || expandedIds.has(id)) {
        continue;
      }

      const isTruncated = nativeElement.scrollHeight > nativeElement.clientHeight;
      if (isTruncated !== nextTruncatedIds.has(id)) {
        changed = true;
        if (isTruncated) {
          nextTruncatedIds.add(id);
        } else {
          nextTruncatedIds.delete(id);
        }
      }
    }

    if (changed) {
      this.truncatedAnnouncementIds.set(nextTruncatedIds);
    }
  }
}
