import { Component, inject } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
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
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
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

  readonly form = this.formBuilder.nonNullable.group({
    title: [
      '',
      [
        trimmedRequiredValidator,
        Validators.maxLength(120),
      ],
    ],
    description: [''],
    linkUrl: ['', httpUrlValidator],
    startDate: [''],
    endDate: [''],
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
      title: value.title.trim(),
      description: value.description.trim() || undefined,
      linkUrl: value.linkUrl.trim() || undefined,
      startDate: this.toDate(value.startDate),
      endDate: this.toDate(value.endDate),
      attachment: this.selectedAttachment,
    });
  }

  private toDate(value: string): Date | undefined {
    if (!value) return undefined;

    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }
}
