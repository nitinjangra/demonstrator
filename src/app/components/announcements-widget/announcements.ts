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

    inject(DestroyRef).onDestroy(() => this.resizeObserver.disconnect());
  }

  ngOnInit(): void {
    this.announcements = this.announcementsActionService.getAnnouncements();
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
