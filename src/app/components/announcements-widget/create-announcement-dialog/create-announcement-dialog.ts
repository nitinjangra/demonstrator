import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import {
  announcementDateRangeValidator,
  httpUrlValidator,
  trimmedRequiredValidator,
} from '../../../shared/validators/announcement.validators';
import { CreateAnnouncementResult } from '../types/create-announcement.types';

@Component({
  selector: 'app-create-announcement-dialog',
  standalone: true,
  imports: [
    MatButtonModule,
    MatDatepickerModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatOptionModule,
    MatSelectModule,
    MatNativeDateModule,
    ReactiveFormsModule,
  ],
  templateUrl: './create-announcement-dialog.html',
  styleUrl: './create-announcement-dialog.scss',
})
export class CreateAnnouncementDialogComponent {
  private readonly formBuilder = inject(FormBuilder);
  private readonly dialogRef = inject(
    MatDialogRef<CreateAnnouncementDialogComponent, CreateAnnouncementResult>,
  );

  readonly form = this.formBuilder.group({
    title: [
      '',
      [
        trimmedRequiredValidator,
        Validators.maxLength(120),
      ],
    ],
    status: this.formBuilder.control<'Draft' | 'Scheduled' | 'Published'>('Draft'),
    description: [''],
    linkUrl: ['', httpUrlValidator],
    startDate: [null as Date | null],
    endDate: [null as Date | null],
  }, { validators: announcementDateRangeValidator });

  selectedAttachment: File | undefined;

  onAttachmentSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedAttachment = input.files?.[0];
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.dialogRef.close({
      title: (value.title ?? '').trim(),
      status: value.status ?? 'Draft',
      description: value.description?.trim() || undefined,
      linkUrl: value.linkUrl?.trim() || undefined,
      startDate: this.toDate(value.startDate),
      endDate: this.toDate(value.endDate),
      attachment: this.selectedAttachment,
    });
  }

  private toDate(value: Date | null): Date | undefined {
    if (!value) return undefined;
    return new Date(value.getFullYear(), value.getMonth(), value.getDate());
  }
}
