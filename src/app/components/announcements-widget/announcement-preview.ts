import { Component, Input } from '@angular/core';
import type { Announcement } from '../../shared/interfaces/announcement.interface';
import { AnnouncementsWidgetComponent } from './announcements';

@Component({
  selector: 'app-announcement-preview',
  standalone: true,
  imports: [AnnouncementsWidgetComponent],
  templateUrl: './announcement-preview.html',
  styleUrl: './announcement-preview.scss',
})
export class AnnouncementPreviewComponent {
  @Input() announcements: Announcement[] | null = null;
}
