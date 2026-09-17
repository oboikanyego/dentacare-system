import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Appointment } from '../../../core/models/appointment.model';
import { MasterDataItem } from '../../../core/models/master-data.model';
import {
  formatLocalDate,
  notPastDateValidator,
  startOfLocalDay
} from '../../../core/validators/date.validators';

export interface AppointmentEditDialogData {
  title: string;
  appointment: Appointment;
  timeSlots: MasterDataItem[];
  canEditStatus?: boolean;
  canEditInternalNotes?: boolean;
  auditNote: string;
}

@Component({
  selector: 'app-appointment-edit-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule,
    MatTooltipModule
  ],
  templateUrl: './appointment-edit-dialog.component.html',
  styleUrls: ['./appointment-edit-dialog.component.css']
})
export class AppointmentEditDialogComponent implements OnInit {
  form!: FormGroup;
  readonly minDate = startOfLocalDay(new Date());
  readonly historicalRecord = ['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(
    this.data.appointment?.status ?? ''
  );

  private readonly fb = inject(FormBuilder);

  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: AppointmentEditDialogData,
    public readonly dialogRef: MatDialogRef<AppointmentEditDialogComponent>
  ) {}

  ngOnInit(): void {
    const initialDate = this.parseAppointmentDate(this.data.appointment?.date);

    this.form = this.fb.group({
      date: [
        initialDate,
        this.historicalRecord
          ? [Validators.required]
          : [Validators.required, notPastDateValidator()]
      ],
      slotId: [this.data.appointment?.slotId ?? '', Validators.required],
      status: [this.data.appointment?.status ?? 'PENDING', Validators.required],
      notes: [this.data.appointment?.notes ?? ''],
      internalNotes: [this.data.appointment?.internalNotes ?? '']
    });

    if (this.historicalRecord) {
      this.form.controls['date'].disable();
      this.form.controls['slotId'].disable();
    }
  }

  save(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    const slot = this.data.timeSlots.find((item) => item.value === value.slotId);

    this.dialogRef.close({
      date: formatLocalDate(value.date),
      slotId: value.slotId,
      time: slot?.label ?? this.data.appointment.time,
      status: value.status,
      notes: value.notes,
      internalNotes: value.internalNotes,
      auditNote: this.data.auditNote
    });
  }

  getDateError(): string {
    const control = this.form?.controls['date'];
    if (!control?.errors || !(control.dirty || control.touched)) return '';
    if (control.errors['required']) return 'Date is required.';
    if (control.errors['pastDate'] || control.errors['matDatepickerMin']) {
      return 'Choose today or a future date.';
    }
    if (control.errors['matDatepickerParse']) return 'Choose a valid date from the calendar.';
    return 'Check the appointment date.';
  }

  cancel(): void {
    this.dialogRef.close();
  }

  private parseAppointmentDate(value?: string): Date | null {
    if (!value) return null;
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) {
      const parsed = new Date(value);
      return Number.isNaN(parsed.getTime()) ? null : parsed;
    }
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
}
