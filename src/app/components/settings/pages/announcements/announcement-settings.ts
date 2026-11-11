import {
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { A11yModule } from '@angular/cdk/a11y';
import { Observable } from 'rxjs';
import type { Announcement } from '../../../../shared/interfaces/announcement.interface';
import {
  AnnouncementsActionService,
  resolveAnnouncementStatus,
} from '../../../announcements-widget/services/announcements-action.service';
import { StickyFooterComponent } from '../../../../shared/components/sticky-footer/sticky-footer.component';
import { UnsavedChangesDialogService } from '../../../../shared/components/unsaved-changes-dialog/unsaved-changes-dialog.component';
import { CreateAnnouncementDialogComponent } from '../../../announcements-widget/create-announcement-dialog/create-announcement-dialog';
import { AnnouncementPreviewComponent } from '../../../announcements-widget/announcement-preview';
import type {
  AnnouncementEditorData,
  CreateAnnouncementResult,
} from '../../../announcements-widget/types/create-announcement.types';

interface DeleteAnnouncementDialogData {
  title: string;
}

@Component({
  selector: 'app-delete-announcement-confirmation',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>Delete announcement?</h2>
    <mat-dialog-content>
      <p>This will permanently remove the announcement. This action cannot be undone.</p>
      <p class="announcement-title">{{ data.title }}</p>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button matButton type="button" mat-dialog-close>Cancel</button>
      <button matButton="filled" type="button" [mat-dialog-close]="true">Delete</button>
    </mat-dialog-actions>
  `,
  styles: `
    .announcement-title { margin-bottom: 0; font-weight: 600; overflow-wrap: anywhere; }
    .mat-mdc-dialog-actions button { min-height: 2.75rem; }
    .mat-mdc-dialog-actions button:focus-visible {
      outline: 2px solid var(--color-primary, #3f51b5);
      outline-offset: 2px;
    }
  `,
})
class DeleteAnnouncementConfirmationDialog {
  readonly data = inject<DeleteAnnouncementDialogData>(MAT_DIALOG_DATA);
}

@Component({
  selector: 'app-announcement-settings',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    A11yModule,
    CreateAnnouncementDialogComponent,
    AnnouncementPreviewComponent,
    StickyFooterComponent,
  ],
  templateUrl: './announcement-settings.html',
  styleUrl: './announcement-settings.scss',
})
export class AnnouncementSettings implements OnInit {
  private readonly announcementsService = inject(AnnouncementsActionService);
  private readonly dialog = inject(MatDialog);
  private readonly unsavedChangesDialog = inject(UnsavedChangesDialogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private returnFocusTo: HTMLElement | null = null;

  @ViewChild('editorDrawer')
  set editorDrawer(drawer: ElementRef<HTMLElement> | undefined) {
    if (!drawer) return;
    queueMicrotask(() => {
      drawer.nativeElement.querySelector<HTMLElement>('button, input, textarea, select, [tabindex]')?.focus();
    });
  }

  @ViewChild(CreateAnnouncementDialogComponent)
  private editorComponent?: CreateAnnouncementDialogComponent;
  announcements$: Observable<Announcement[]> = this.announcementsService.getAllAnnouncements();
  announcements: Announcement[] = [];
  private announcementOrder: string[] = [];
  private hasPendingContentChanges = false;
  saved = false;

  editorOpen = false;
  editorData: AnnouncementEditorData | null = null;

  get hasOrderChanges(): boolean {
    const currentIds = new Set(this.announcements.map((announcement) => announcement.id));
    const expectedOrder = this.announcementOrder.filter((id) => currentIds.has(id));
    const currentOrder = this.announcements
      .filter((announcement) => this.announcementOrder.includes(announcement.id))
      .map((announcement) => announcement.id);

    return expectedOrder.some((id, index) => id !== currentOrder[index]);
  }

  get hasUnsavedChanges(): boolean {
    return this.hasPendingContentChanges || this.hasOrderChanges;
  }

  canDeactivate(): boolean | Observable<boolean> {
    return this.unsavedChangesDialog.confirmIfNeeded(this.hasUnsavedChanges || this.editorOpen);
  }

  @HostListener('window:beforeunload', ['$event'])
  warnBeforeLeaving(event: BeforeUnloadEvent): void {
    this.unsavedChangesDialog.warnBeforeUnload(event, this.hasUnsavedChanges || this.editorOpen);
  }

  get canAddAnnouncement(): boolean {
    return this.announcements.length < AnnouncementsActionService.maxAnnouncements;
  }

  ngOnInit(): void {
    this.announcements$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((announcements) => {
      this.announcements = [...announcements];
      this.announcementOrder = announcements.map((announcement) => announcement.id);
      this.changeDetector.markForCheck();
    });
  }

  moveAnnouncement(index: number, offset: -1 | 1): void {
    const destination = index + offset;
    if (index < 0 || destination < 0 || destination >= this.announcements.length) return;

    const updated = [...this.announcements];
    [updated[index], updated[destination]] = [updated[destination], updated[index]];
    this.announcements = updated;
    this.saved = false;
    this.changeDetector.markForCheck();
  }

  deleteAnnouncement(id: string): void {
    const announcement = this.announcements.find((item) => item.id === id);
    if (!announcement) return;

    this.dialog
      .open(DeleteAnnouncementConfirmationDialog, {
        data: { title: announcement.title },
        role: 'alertdialog',
      })
      .afterClosed()
      .subscribe((confirmed) => {
        if (confirmed) this.removeAnnouncement(id);
      });
  }

  private removeAnnouncement(id: string): void {
    this.announcements = this.announcements.filter((announcement) => announcement.id !== id);
    this.saved = false;
    this.hasPendingContentChanges = true;
    this.changeDetector.markForCheck();
  }

  openEditAnnouncement(id: string): void {
    const announcement = this.announcements.find((item) => item.id === id);
    if (!announcement) return;

    this.captureReturnFocus();
    this.editorData = { mode: 'edit', announcement };
    this.editorOpen = true;
    this.changeDetector.markForCheck();
  }

  openCreateAnnouncementDialog(): void {
    if (!this.canAddAnnouncement) return;

    this.captureReturnFocus();
    this.editorData = { mode: 'create' };
    this.editorOpen = true;
    this.changeDetector.markForCheck();
  }

  requestCloseAnnouncementEditor(): void {
    this.editorComponent?.cancel();
  }

  dismissAnnouncementEditor(): void {
    this.editorOpen = false;
    this.editorData = null;
    this.changeDetector.markForCheck();
    queueMicrotask(() => {
      if (this.returnFocusTo?.isConnected) this.returnFocusTo.focus();
      this.returnFocusTo = null;
    });
  }

  saveAnnouncementFromEditor(result: CreateAnnouncementResult): void {
    const editorData = this.editorData;
    if (!editorData) return;

    if (editorData.mode === 'edit' && editorData.announcement) {
      const id = editorData.announcement.id;
      const { attachment, intent, removeAttachment, ...fields } = result;
      this.announcements = this.announcements.map((item) =>
        item.id === id
          ? {
              ...item,
              ...fields,
              status: resolveAnnouncementStatus(
                fields.startDate,
                fields.endDate,
                intent ?? (fields.status === 'Draft' ? 'draft' : 'publish'),
                fields.status ?? item.status,
              ),
              attachmentUrl: attachment
                ? URL.createObjectURL(attachment)
                : removeAttachment
                  ? undefined
                  : item.attachmentUrl,
              attachmentName: attachment
                ? attachment.name
                : removeAttachment
                  ? undefined
                  : item.attachmentName,
            }
          : item,
      );
      this.saved = false;
      this.hasPendingContentChanges = true;
    } else {
      const { attachment, intent, ...fields } = result;
      delete fields.removeAttachment;
      const id = crypto.randomUUID();
      this.announcements = [
        ...this.announcements,
        {
          ...fields,
          id,
          status: resolveAnnouncementStatus(
            fields.startDate,
            fields.endDate,
            intent ?? (fields.status === 'Draft' ? 'draft' : 'publish'),
            fields.status,
          ),
          attachmentUrl: attachment ? URL.createObjectURL(attachment) : undefined,
          attachmentName: attachment?.name,
        },
      ];
      this.announcementOrder = [...this.announcementOrder, id];
      this.saved = false;
      this.hasPendingContentChanges = true;
    }

    this.dismissAnnouncementEditor();
    this.changeDetector.markForCheck();
  }

  save(): void {
    if (!this.hasUnsavedChanges) return;
    this.announcementsService.saveAnnouncements(this.announcements);
    this.announcementOrder = this.announcements.map((announcement) => announcement.id);
    this.hasPendingContentChanges = false;
    this.saved = true;
    this.changeDetector.markForCheck();
  }

  discardOrder(): void {
    if (!this.hasOrderChanges) return;

    const orderIndex = new Map(this.announcementOrder.map((id, index) => [id, index]));
    this.announcements = [...this.announcements].sort(
      (first, second) =>
        (orderIndex.get(first.id) ?? Number.MAX_SAFE_INTEGER) -
        (orderIndex.get(second.id) ?? Number.MAX_SAFE_INTEGER),
    );
    this.changeDetector.markForCheck();
  }

  private captureReturnFocus(): void {
    this.returnFocusTo = document.activeElement instanceof HTMLElement ? document.activeElement : null;
  }
}
