import {
  afterEveryRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  Input,
  OnChanges,
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
import { Observable, filter, of } from 'rxjs';
import type { Announcement } from '../../shared/interfaces/announcement.interface';
import { HoldFeedbackDirective } from '../../shared/directives/hold-feedback.directive';
import { CreateAnnouncementDialogComponent } from './create-announcement-dialog/create-announcement-dialog';
import type { CreateAnnouncementResult } from './types/create-announcement.types';
import {
  AnnouncementsActionService,
  filterAnnouncementsForDisplay,
} from './services/announcements-action.service';

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
export class AnnouncementsWidgetComponent implements OnInit, OnChanges {
  @Input() showContextMenu = true;
  @Input() announcementItems: Announcement[] | null = null;

  private readonly expandedAnnouncementIds = signal<ReadonlySet<string>>(new Set());
  private readonly truncatedAnnouncementIds = signal<ReadonlySet<string>>(new Set());
  private readonly descriptionElements =
    viewChildren<ElementRef<HTMLParagraphElement>>('announcementDescription');
  private readonly observedDescriptions = new Set<HTMLParagraphElement>();
  private readonly resizeObserver = new ResizeObserver(() => this.updateTruncatedDescriptions());

  announcements: Observable<Announcement[]> = of([]);
  private readonly announcementsActionService = inject(AnnouncementsActionService);
  private readonly dialog = inject(MatDialog);

  get canAddAnnouncement(): boolean {
    return this.announcementsActionService.canAddAnnouncement;
  }

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
    });
  }

  ngOnInit(): void {
    this.updateAnnouncementsFeed();
  }

  ngOnChanges(): void {
    this.updateAnnouncementsFeed();
  }

  private updateAnnouncementsFeed(): void {
    this.announcements = this.announcementItems
      ? of(filterAnnouncementsForDisplay(this.announcementItems))
      : this.announcementsActionService.getAnnouncements();
  }

  openCreateAnnouncementDialog(): void {
    this.dialog
      .open(CreateAnnouncementDialogComponent, {
        width: 'min(32rem, calc(100vw - 2rem))',
      })
      .afterClosed()
      .pipe(
        filter((announcement): announcement is CreateAnnouncementResult => !!announcement),
      )
      .subscribe((announcement) => this.announcementsActionService.addAnnouncement(announcement));
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
