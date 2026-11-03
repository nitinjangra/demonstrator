import { ValidationErrors, ValidatorFn } from '@angular/forms';

export const httpUrlValidator: ValidatorFn = (control): ValidationErrors | null => {
  const value = String(control.value ?? '').trim();
  if (!value) return null;

  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:' ? null : { url: true };
  } catch {
    return { url: true };
  }
};

export const announcementDateRangeValidator: ValidatorFn = (
  control,
): ValidationErrors | null => {
  const startDate = parseAnnouncementDate(control.get('startDate')?.value);
  const endDate = parseAnnouncementDate(control.get('endDate')?.value);

  if (startDate === null || endDate === null) return { dateRange: true };
  if (startDate === undefined || endDate === undefined) return null;

  return endDate < startDate ? { dateRange: true } : null;
};

const parseAnnouncementDate = (value: unknown): Date | undefined | null => {
  if (value === null || value === undefined || value === '') return undefined;

  const date = value instanceof Date ? new Date(value.getTime()) :
    typeof value === 'string' ? new Date(value) : null;

  return date && !Number.isNaN(date.getTime()) ? date : null;
};

export const trimmedRequiredValidator: ValidatorFn = (control): ValidationErrors | null =>
  String(control.value ?? '').trim() ? null : { required: true };
