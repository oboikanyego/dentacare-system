import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
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
  formatApiDate,
  notPastDateValidator,
  parseApiDate,
  startOfToday
} from '../../../core/utils/date.utils';

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
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule,
    MatTooltipModule,
    MatIconModule
  ],
  templateUrl: './appointment-edit-dialog.component.html',
  styleUrls: ['./appointment-edit-dialog.component.css']
})
export class AppointmentEditDialogComponent implements OnInit {
  form!: FormGroup;
  readonly minDate = startOfToday();

  private readonly fb = inject(FormBuilder);

  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: AppointmentEditDialogData,
    public readonly dialogRef: MatDialogRef<AppointmentEditDialogComponent>
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      date: [
        parseApiDate(this.data.appointment?.date),
        [Validators.required, notPastDateValidator()]
      ],
      slotId: [this.data.appointment?.slotId ?? '', Validators.required],
      status: [this.data.appointment?.status ?? 'Pending', Validators.required],
      notes: [this.data.appointment?.notes ?? ''],
      internalNotes: [this.data.appointment?.internalNotes ?? '']
    });
  }

  getDateError(): string {
    const control = this.form?.get('date');
    if (!control?.errors || !(control.touched || control.dirty)) return '';
    if (control.errors['required']) return 'Date is required.';
    if (control.errors['pastDate'] || control.errors['matDatepickerMin']) {
      return 'Choose today or a future date.';
    }
    return 'Choose a valid date from the calendar.';
  }

  save(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    const slot = this.data.timeSlots.find((item) => item.value === value.slotId);

    this.dialogRef.close({
      date: formatApiDate(value.date),
      slotId: value.slotId,
      time: slot?.label ?? this.data.appointment.time,
      status: value.status,
      notes: value.notes,
      internalNotes: value.internalNotes,
      auditNote: this.data.auditNote
    });
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
