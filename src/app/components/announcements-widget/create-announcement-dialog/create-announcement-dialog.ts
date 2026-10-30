import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { StickyFooterComponent } from '../../../shared/components/sticky-footer/sticky-footer.component';
import type { FooterStyles } from '../../../shared/components/sticky-footer/sticky-footer.component';
import {
  announcementDateRangeValidator,
  httpUrlValidator,
  trimmedRequiredValidator,
} from '../../../shared/validators/announcement.validators';
import type { AnnouncementEditorData, CreateAnnouncementResult } from '../types/create-announcement.types';

const ACCEPTED_ATTACHMENT_TYPES = '.jpg,.jpeg,.png,image/jpeg,image/png';

@Component({
  selector: 'app-create-announcement-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatNativeDateModule,
    ReactiveFormsModule,
    StickyFooterComponent,
  ],
  templateUrl: './create-announcement-dialog.html',
  styleUrl: './create-announcement-dialog.scss',
})
export class CreateAnnouncementDialogComponent implements OnInit {
  private static readonly maxAttachmentSizeBytes = 2 * 1024 * 1024;
  readonly acceptedAttachmentTypes = ACCEPTED_ATTACHMENT_TYPES;
  private readonly formBuilder = inject(FormBuilder);
  private readonly injectedData = inject<AnnouncementEditorData | null>(MAT_DIALOG_DATA, {
    optional: true,
  });
  private readonly dialogRef = inject<
    MatDialogRef<CreateAnnouncementDialogComponent, CreateAnnouncementResult> | null
  >(MatDialogRef, { optional: true });

  @Input() editorData: AnnouncementEditorData | null = null;
  @Output() saved = new EventEmitter<CreateAnnouncementResult>();
  @Output() cancelled = new EventEmitter<void>();

  readonly form = this.formBuilder.group(
    {
      title: ['', [trimmedRequiredValidator, Validators.maxLength(120)]],
      status: this.formBuilder.control<'Draft' | 'Scheduled' | 'Published' | 'Expired'>('Draft'),
      description: [''],
      linkUrl: ['', httpUrlValidator],
      startDate: [null as Date | null],
      endDate: [null as Date | null],
    },
    { validators: announcementDateRangeValidator },
  );

  selectedAttachment: File | undefined;
  attachmentError: string | null = null;
  readonly actionFooterStyles: FooterStyles = {
    height: 'auto',
  };

  get modeData(): AnnouncementEditorData {
    return this.editorData ?? this.injectedData ?? { mode: 'create' };
  }

  get isEditing(): boolean {
    return this.modeData.mode === 'edit';
  }

  get isEmbedded(): boolean {
    return this.dialogRef === null;
  }

  get existingAttachmentName(): string | undefined {
    return this.modeData.announcement?.attachmentName;
  }

  ngOnInit(): void {
    const announcement = this.modeData.announcement;
    if (!announcement) return;

    this.form.patchValue({
      title: announcement.title,
      status: announcement.status,
      description: announcement.description ?? '',
      linkUrl: announcement.linkUrl ?? '',
      startDate: announcement.startDate ? new Date(announcement.startDate) : null,
      endDate: announcement.endDate ? new Date(announcement.endDate) : null,
    });
  }

  onAttachmentSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    this.attachmentError = null;

    if (!file) {
      this.selectedAttachment = undefined;
      return;
    }

    const error = this.getAttachmentError(file);
    if (error) {
      this.selectedAttachment = undefined;
      this.attachmentError = error;
      input.value = '';
      return;
    }

    this.selectedAttachment = file;
  }

  submit(): void {
    if (this.selectedAttachment) {
      this.attachmentError = this.getAttachmentError(this.selectedAttachment);
    }
    if (this.attachmentError) {
      return;
    }

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    const result: CreateAnnouncementResult = {
      title: (value.title ?? '').trim(),
      status: value.status ?? 'Draft',
      description: value.description?.trim() || undefined,
      linkUrl: value.linkUrl?.trim() || undefined,
      startDate: this.toDate(value.startDate),
      endDate: this.toDate(value.endDate),
      attachment: this.selectedAttachment,
    };

    if (this.dialogRef) this.dialogRef.close(result);
    else this.saved.emit(result);
  }

  cancel(): void {
    if (this.dialogRef) this.dialogRef.close();
    else this.cancelled.emit();
  }

  private toDate(value: Date | null): Date | undefined {
    if (!value) return undefined;
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }

  private isAllowedImage(file: File): boolean {
    const type = file.type.toLowerCase();
    if (type) return type === 'image/jpeg' || type === 'image/png';
    return /\.(jpe?g|png)$/i.test(file.name);
  }

  private getAttachmentError(file: File): string | null {
    if (!this.isAllowedImage(file)) return 'Choose a JPG or PNG image.';
    if (file.size > CreateAnnouncementDialogComponent.maxAttachmentSizeBytes) {
      return 'The image must be 2 MB or smaller.';
    }
    return null;
  }
}
