import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function startOfLocalDay(value: Date): Date {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

export function isPastDate(value: unknown, referenceDate = new Date()): boolean {
  if (!value) return false;

  const parsed = value instanceof Date ? new Date(value) : new Date(String(value));
  if (Number.isNaN(parsed.getTime())) return false;

  return startOfLocalDay(parsed).getTime() < startOfLocalDay(referenceDate).getTime();
}

export function notPastDateValidator(referenceDate: () => Date = () => new Date()): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null =>
    isPastDate(control.value, referenceDate()) ? { pastDate: true } : null;
}

export function formatLocalDate(value: unknown): string {
  if (!value) return '';

  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}
