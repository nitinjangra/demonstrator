import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { Priority } from '../../../../shared/enums/priority.enum';
import type { ActionTableRow } from '../../../../shared/interfaces/actions-table.interface';
import type { Announcement, AnnouncementStatus } from '../../../../shared/interfaces/announcement.interface';
import { mockAnnouncements } from '../../../../shared/mocks/mock-announcements';
import { AnnouncementsWidgetComponent } from '../../../announcements-widget/announcements';
import { AgTableStateService } from '../../../actions-table-wrapper/shared/services/ag-table-state.service';
import { MockActionDataService } from '../../../actions-table-wrapper/shared/services/mock-action-data.service';
import { AnnouncementsActionService } from '../../../announcements-widget/services/announcements-action.service';

type MockComponent = 'actions-table' | 'announcement-widget';
type PayloadResult =
  | { component: 'actions-table'; data: ActionTableRow[] }
  | { component: 'announcement-widget'; data: Announcement[] }
  | { error: string };

const ANNOUNCEMENT_STATUSES: AnnouncementStatus[] = ['Published', 'Scheduled', 'Draft', 'Expired'];

@Component({
  selector: 'app-mock-driver',
  standalone: true,
  imports: [AnnouncementsWidgetComponent, MatButtonModule, RouterLink],
  templateUrl: './mock-driver.html',
  styleUrl: './mock-driver.scss',
})
export class MockDriver {
  private readonly mockData = inject(MockActionDataService);
  private readonly tableState = inject(AgTableStateService);
  private readonly announcements = inject(AnnouncementsActionService);

  readonly selectedComponent = signal<MockComponent | null>(null);
  readonly payload = signal('[]');
  readonly statusMessage = signal('');
  readonly payloadResult = computed(() => this.parsePayload(this.payload()));
  readonly validationError = computed(() => {
    const result = this.payloadResult();
    return 'error' in result ? result.error : null;
  });
  readonly actionRows = computed(() => {
    const result = this.payloadResult();
    return 'component' in result && result.component === 'actions-table' ? result.data : [];
  });
  readonly announcementItems = computed(() => {
    const result = this.payloadResult();
    return 'component' in result && result.component === 'announcement-widget' ? result.data : [];
  });
  readonly itemCount = computed(() => {
    const result = this.payloadResult();
    return 'component' in result ? result.data.length : null;
  });

  selectComponent(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedComponent.set(value === 'actions-table' || value === 'announcement-widget' ? value : null);
    this.payload.set('[]');
    this.statusMessage.set('');
  }

  onPayloadInput(event: Event): void {
    this.payload.set((event.target as HTMLTextAreaElement).value);
    this.statusMessage.set('');
  }

  loadMockData(): void {
    const component = this.selectedComponent();
    if (component === 'actions-table') {
      const rows = this.createSampleActions();
      this.payload.set(JSON.stringify(rows, null, 2));
      this.statusMessage.set('Sample action data loaded. Apply it to update the table.');
    } else if (component === 'announcement-widget') {
      this.payload.set(JSON.stringify(mockAnnouncements, null, 2));
      this.statusMessage.set('Sample announcement data loaded. Apply it to update the widget.');
    }
  }

  loadEmptyState(): void {
    if (!this.selectedComponent()) return;
    this.payload.set('[]');
    this.statusMessage.set('Empty data loaded. Apply it to preview the empty state.');
  }

  applyPayload(): void {
    const result = this.payloadResult();
    if (!('component' in result)) return;

    if (result.component === 'actions-table') {
      this.mockData.saveRows(result.data);
      this.tableState.setRowData(result.data);
    } else {
      this.announcements.saveAnnouncements(result.data);
    }
    const name = result.component === 'actions-table' ? 'action' : 'announcement';
    this.statusMessage.set(`Applied ${result.data.length} mock ${name}${result.data.length === 1 ? '' : 's'}.`);
  }

  resetToDefault(): void {
    const component = this.selectedComponent();
    if (component === 'actions-table') {
      this.mockData.reset();
      const rows = this.mockData.getRows();
      this.tableState.setRowData(rows);
      this.payload.set(JSON.stringify(rows, null, 2));
      this.statusMessage.set('Reset to the project default action data.');
    } else if (component === 'announcement-widget') {
      this.announcements.saveAnnouncements(mockAnnouncements);
      this.payload.set(JSON.stringify(mockAnnouncements, null, 2));
      this.statusMessage.set('Reset to the project default announcement data.');
    }
  }

  private createSampleActions(): ActionTableRow[] {
    return Array.from({ length: 12 }, (_, index) => ({
      id: index + 1,
      entityName: `Sample action ${index + 1}`,
      entityId: `sample-action-${index + 1}`,
      dueDate: new Date(Date.UTC(2026, 10, index + 1, 12)).toISOString(),
      priority: [Priority.High, Priority.Medium, Priority.Low][index % 3],
    }));
  }

  private parsePayload(value: string): PayloadResult {
    const component = this.selectedComponent();
    if (!component) return { error: 'Choose a component to edit its mock data.' };

    let parsed: unknown;
    try {
      parsed = JSON.parse(value);
    } catch {
      return { error: 'Enter valid JSON containing an array.' };
    }

    if (!Array.isArray(parsed)) return { error: 'The payload must be a JSON array.' };
    return component === 'actions-table'
      ? this.parseActionRows(parsed)
      : this.parseAnnouncements(parsed);
  }

  private parseActionRows(parsed: unknown[]): PayloadResult {
    const rows: ActionTableRow[] = [];
    for (const [index, item] of parsed.entries()) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return { error: `Action ${index + 1} must be an object.` };
      }

      const row = item as Record<string, unknown>;
      if (typeof row['id'] !== 'number' || !Number.isFinite(row['id'])) {
        return { error: `Action ${index + 1} must have a numeric id.` };
      }
      if (typeof row['entityName'] !== 'string' || !row['entityName'].trim()) {
        return { error: `Action ${index + 1} must have an entityName.` };
      }
      if (typeof row['entityId'] !== 'string' || !row['entityId'].trim()) {
        return { error: `Action ${index + 1} must have an entityId.` };
      }
      if (
        row['dueDate'] !== null &&
        (typeof row['dueDate'] !== 'string' || !Number.isFinite(new Date(row['dueDate']).getTime()))
      ) {
        return { error: `Action ${index + 1} must have a valid ISO dueDate or null.` };
      }
      if (row['priority'] !== undefined && !Object.values(Priority).includes(row['priority'] as Priority)) {
        return { error: `Action ${index + 1} priority must be High, Medium, or Low.` };
      }

      rows.push({
        id: row['id'],
        entityName: row['entityName'],
        entityId: row['entityId'],
        dueDate: row['dueDate'],
        ...(row['priority'] === undefined ? {} : { priority: row['priority'] as Priority }),
      });
    }
    return { component: 'actions-table', data: rows };
  }

  private parseAnnouncements(parsed: unknown[]): PayloadResult {
    const items: Announcement[] = [];
    for (const [index, item] of parsed.entries()) {
      if (!item || typeof item !== 'object' || Array.isArray(item)) {
        return { error: `Announcement ${index + 1} must be an object.` };
      }

      const announcement = item as Record<string, unknown>;
      if (typeof announcement['id'] !== 'string' || !announcement['id'].trim()) {
        return { error: `Announcement ${index + 1} must have a string id.` };
      }
      if (typeof announcement['title'] !== 'string' || !announcement['title'].trim()) {
        return { error: `Announcement ${index + 1} must have a title.` };
      }
      if (!ANNOUNCEMENT_STATUSES.includes(announcement['status'] as AnnouncementStatus)) {
        return { error: `Announcement ${index + 1} status must be Published, Scheduled, Draft, or Expired.` };
      }

      const optionalTextFields = ['description', 'imageUrl', 'attachmentUrl', 'attachmentName', 'linkUrl'];
      for (const field of optionalTextFields) {
        if (announcement[field] !== undefined && typeof announcement[field] !== 'string') {
          return { error: `Announcement ${index + 1} ${field} must be a string when provided.` };
        }
      }

      const startDate = this.parseAnnouncementDate(announcement['startDate'], index, 'startDate');
      if (typeof startDate === 'string') return { error: startDate };
      const endDate = this.parseAnnouncementDate(announcement['endDate'], index, 'endDate');
      if (typeof endDate === 'string') return { error: endDate };

      items.push({
        id: announcement['id'],
        title: announcement['title'],
        status: announcement['status'] as AnnouncementStatus,
        ...(typeof announcement['description'] === 'string' ? { description: announcement['description'] } : {}),
        ...(typeof announcement['imageUrl'] === 'string' ? { imageUrl: announcement['imageUrl'] } : {}),
        ...(typeof announcement['attachmentUrl'] === 'string' ? { attachmentUrl: announcement['attachmentUrl'] } : {}),
        ...(typeof announcement['attachmentName'] === 'string' ? { attachmentName: announcement['attachmentName'] } : {}),
        ...(typeof announcement['linkUrl'] === 'string' ? { linkUrl: announcement['linkUrl'] } : {}),
        ...(startDate ? { startDate } : {}),
        ...(endDate ? { endDate } : {}),
      });
    }
    return { component: 'announcement-widget', data: items };
  }

  private parseAnnouncementDate(
    value: unknown,
    index: number,
    field: 'startDate' | 'endDate',
  ): Date | undefined | string {
    if (value === undefined || value === null) return undefined;
    if (typeof value !== 'string' || !Number.isFinite(new Date(value).getTime())) {
      return `Announcement ${index + 1} ${field} must be a valid date string.`;
    }
    return new Date(value);
  }
}
