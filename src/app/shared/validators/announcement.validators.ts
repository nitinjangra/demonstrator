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
  const startDate = control.get('startDate')?.value;
  const endDate = control.get('endDate')?.value;

  if (!(startDate instanceof Date) || !(endDate instanceof Date)) {
    return null;
  }

  return endDate < startDate ? { dateRange: true } : null;
};

export const trimmedRequiredValidator: ValidatorFn = (control): ValidationErrors | null =>
  String(control.value ?? '').trim() ? null : { required: true };
