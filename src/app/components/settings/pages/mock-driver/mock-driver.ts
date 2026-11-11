import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { Priority } from '../../../../shared/enums/priority.enum';
import type { ActionTableRow } from '../../../../shared/interfaces/actions-table.interface';
import type { Announcement, AnnouncementStatus } from '../../../../shared/interfaces/announcement.interface';
import { take } from 'rxjs';
import { StickyFooterComponent } from '../../../../shared/components/sticky-footer/sticky-footer.component';
import { mockAnnouncements } from '../../../../shared/mocks/mock-announcements';
import { mockDriverAnnouncements } from '../../../../shared/mocks/mock-driver-announcements';
import { AnnouncementsWidgetComponent } from '../../../announcements-widget/announcements';
import { AgTableStateService } from '../../../actions-table-wrapper/shared/services/ag-table-state.service';
import { MockActionDataService } from '../../../actions-table-wrapper/shared/services/mock-action-data.service';
import { mockTableData } from '../../../actions-table-wrapper/shared/mock/actions-table.mock';
import { AnnouncementsActionService } from '../../../announcements-widget/services/announcements-action.service';

type MockComponent = 'actions-table' | 'announcement-widget';
type Scenario = 'default' | 'empty' | 'many' | 'long-text' | 'mixed-statuses' | 'error' | 'loading';
type PayloadResult =
  | { component: 'actions-table'; data: ActionTableRow[] }
  | { component: 'announcement-widget'; data: Announcement[] }
  | { error: string };

const ANNOUNCEMENT_STATUSES: AnnouncementStatus[] = ['Published', 'Scheduled', 'Draft', 'Expired'];

@Component({
  selector: 'app-mock-driver',
  standalone: true,
  imports: [
    AnnouncementsWidgetComponent,
    DatePipe,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    StickyFooterComponent,
  ],
  templateUrl: './mock-driver.html',
  styleUrl: './mock-driver.scss',
})
export class MockDriver {
  private readonly mockData = inject(MockActionDataService);
  private readonly tableState = inject(AgTableStateService);
  private readonly announcements = inject(AnnouncementsActionService);

  readonly selectedComponent = signal<MockComponent | null>(null);
  readonly payload = signal('[]');
  readonly appliedPayload = signal('');
  readonly appliedState = signal('Choose a component');
  readonly appliedAt = signal<Date | null>(null);
  readonly isLoadingPreview = signal(false);
  readonly statusMessage = signal('');
  private loadingTimer?: ReturnType<typeof setTimeout>;
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
  readonly announcementStatusCounts = computed(() => {
    const counts: Record<AnnouncementStatus, number> = {
      Published: 0,
      Scheduled: 0,
      Draft: 0,
      Expired: 0,
    };
    for (const item of this.announcementItems()) counts[item.status] += 1;
    return counts;
  });

  selectComponent(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    const component = value === 'actions-table' || value === 'announcement-widget' ? value : null;
    const currentComponent = this.selectedComponent();
    if (
      currentComponent && currentComponent !== component && this.isDirty &&
      !window.confirm('Discard your unapplied edits and switch components?')
    ) {
      (event.target as HTMLSelectElement).value = currentComponent;
      return;
    }
    if (this.loadingTimer) clearTimeout(this.loadingTimer);
    this.isLoadingPreview.set(false);
    this.selectedComponent.set(component);
    this.statusMessage.set('');

    if (component === 'actions-table') {
      const rows = this.mockData.getRows();
      const serialized = JSON.stringify(rows, null, 2);
      this.payload.set(serialized);
      this.appliedPayload.set(serialized);
      this.appliedState.set(this.getAppliedState(component, rows));
    } else if (component === 'announcement-widget') {
      this.announcements
        .getAllAnnouncements()
        .pipe(take(1))
        .subscribe((items) => {
          const serialized = JSON.stringify(items, null, 2);
          this.payload.set(serialized);
          this.appliedPayload.set(serialized);
          this.appliedState.set(this.getAppliedState(component, items));
        });
    } else {
      this.payload.set('[]');
    }
  }

  onPayloadInput(event: Event): void {
    this.payload.set((event.target as HTMLTextAreaElement).value);
    this.statusMessage.set('');
  }

  get isDirty(): boolean {
    return this.payload() !== this.appliedPayload();
  }

  selectScenario(event: Event): void {
    const scenario = (event.target as HTMLSelectElement).value as Scenario;
    if (!scenario) return;
    if (this.isDirty && !window.confirm('Replace your unapplied edits with this scenario?')) return;
    if (this.loadingTimer) clearTimeout(this.loadingTimer);
    this.isLoadingPreview.set(false);
    const component = this.selectedComponent();
    if (!component) return;
    if (scenario === 'error') {
      this.payload.set('[{ "id": ]');
      this.statusMessage.set('Error scenario loaded into the draft. The invalid JSON message is announced below.');
      return;
    }
    if (scenario === 'loading') {
      this.payload.set(this.appliedPayload());
      this.isLoadingPreview.set(true);
      this.statusMessage.set('Showing the loading preview for a moment.');
      this.loadingTimer = setTimeout(() => this.isLoadingPreview.set(false), 1500);
      return;
    }
    const defaultData = component === 'actions-table' ? mockTableData : mockAnnouncements;
    let data: ActionTableRow[] | Announcement[] = defaultData;
    if (scenario === 'empty') data = [];
    if (scenario === 'many') {
      data = component === 'actions-table' ? this.createSampleActions(50) : this.createManyAnnouncements(50);
    }
    if (scenario === 'long-text') {
      data = component === 'announcement-widget'
        ? this.createLongTextAnnouncements()
        : this.createSampleActions(1, true);
    }
    if (scenario === 'mixed-statuses' && component === 'announcement-widget') {
      data = mockDriverAnnouncements;
    }
    this.payload.set(JSON.stringify(data, null, 2));
    this.statusMessage.set(`${this.scenarioLabel(scenario)} scenario loaded into the draft. Apply to use it in the app.`);
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
    this.appliedPayload.set(this.payload());
    this.appliedAt.set(new Date());
    this.appliedState.set(this.getAppliedState(result.component, result.data));
    const target = result.component === 'actions-table' ? 'Actions table' : 'Announcement widget';
    this.statusMessage.set(`Applied to ${target}.`);
  }

  resetToDefault(): void {
    const component = this.selectedComponent();
    if (!component) return;
    if (
      this.isDirty &&
      !window.confirm('Replace your unapplied draft with the project default?')
    ) {
      return;
    }

    let defaultData: ActionTableRow[] | Announcement[];
    if (component === 'actions-table') {
      defaultData = mockTableData;
    } else if (component === 'announcement-widget') {
      defaultData = mockAnnouncements;
    } else {
      return;
    }

    this.payload.set(JSON.stringify(defaultData, null, 2));
    this.statusMessage.set(
      this.isDirty
        ? 'Project default loaded into the draft. Apply to use it in the app.'
        : 'Project default is already applied.',
    );
  }

  private scenarioLabel(scenario: Scenario): string {
    return {
      default: 'Default',
      empty: 'Empty',
      many: 'Many items',
      'long-text': 'Long text',
      'mixed-statuses': 'Mixed statuses',
      error: 'Error',
      loading: 'Loading',
    }[scenario];
  }

  private getAppliedState(component: MockComponent, data: ActionTableRow[] | Announcement[]): string {
    const projectDefault = component === 'actions-table' ? mockTableData : mockAnnouncements;
    return JSON.stringify(data) === JSON.stringify(projectDefault)
      ? 'Project default'
      : 'Custom data applied';
  }

  private createSampleActions(count = 12, longText = false): ActionTableRow[] {
    return Array.from({ length: count }, (_, index) => ({
      id: index + 1,
      entityName: longText
        ? `Sample action ${index + 1}: ${'Review supporting documentation and coordinate the next operational milestone. '.repeat(4)}`
        : `Sample action ${index + 1}`,
      entityId: `sample-action-${index + 1}`,
      dueDate: new Date(Date.UTC(2026, 10, index + 1, 12)).toISOString(),
      priority: [Priority.High, Priority.Medium, Priority.Low][index % 3],
    }));
  }

  private createManyAnnouncements(count: number): Announcement[] {
    return Array.from({ length: count }, (_, index) => ({
      id: `scenario-announcement-${index + 1}`,
      title: `Scenario announcement ${index + 1}`,
      status: 'Published' as const,
    }));
  }

  private createLongTextAnnouncements(): Announcement[] {
    return [{
      id: 'long-title-announcement',
      title: `A long announcement title for checking wrapping and layout ${'across narrow screens '.repeat(5)}`,
      status: 'Published',
      description: `This announcement has no fixed limit on its description. ${'Review the full message and make sure the preview remains readable. '.repeat(10)}`,
    }];
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
