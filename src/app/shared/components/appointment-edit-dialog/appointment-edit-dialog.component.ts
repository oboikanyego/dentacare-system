import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Appointment } from '../../../core/models/appointment.model';
import { MasterDataItem } from '../../../core/models/master-data.model';
import { MatIconModule } from '@angular/material/icon';

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
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,MatIconModule
  ],
  templateUrl: './appointment-edit-dialog.component.html',
  styleUrls: ['./appointment-edit-dialog.component.css']
})
export class AppointmentEditDialogComponent implements OnInit {
  form!: FormGroup;

  private readonly fb = inject(FormBuilder);

  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: AppointmentEditDialogData,
    public readonly dialogRef: MatDialogRef<AppointmentEditDialogComponent>
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      date: [this.data.appointment?.date ?? '', Validators.required],
      slotId: [this.data.appointment?.slotId ?? '', Validators.required],
      status: [this.data.appointment?.status ?? 'Pending', Validators.required],
      notes: [this.data.appointment?.notes ?? ''],
      internalNotes: [this.data.appointment?.internalNotes ?? '']
    });
  }

  save(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    const slot = this.data.timeSlots.find((item) => item.value === value.slotId);

    this.dialogRef.close({
      date: value.date,
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
