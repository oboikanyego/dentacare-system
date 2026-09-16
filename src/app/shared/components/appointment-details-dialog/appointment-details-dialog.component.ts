import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { Appointment } from '../../../core/models/appointment.model';

export interface AppointmentDetailsDialogData {
  appointment: Appointment;
  showPatientDetails?: boolean;
}

@Component({
  selector: 'app-appointment-details-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './appointment-details-dialog.component.html',
  styleUrl: './appointment-details-dialog.component.css'
})
export class AppointmentDetailsDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: AppointmentDetailsDialogData,
    public readonly dialogRef: MatDialogRef<AppointmentDetailsDialogComponent>
  ) {}

  get appointment(): Appointment {
    return this.data.appointment;
  }

  get isSampleAppointment(): boolean {
    return this.appointment.email?.toLowerCase().endsWith('@dentacare.example') ?? false;
  }

  get patientName(): string {
    if (this.isSampleAppointment) return this.appointment.patientName;
    const value = this.appointment.patientName?.trim();
    if (!value) return 'Patient';
    return value.split(/\s+/).map((part) => `${part.charAt(0)}•••`).join(' ');
  }

  get email(): string {
    if (this.isSampleAppointment) return this.appointment.email || '—';
    if (!this.appointment.email) return '—';
    const [local] = this.appointment.email.split('@');
    return `${local?.charAt(0) || '•'}•••@•••`;
  }

  get phone(): string {
    if (this.isSampleAppointment) return this.appointment.phone || '—';
    if (!this.appointment.phone) return '—';
    const clean = this.appointment.phone.replace(/\s+/g, '');
    return clean.length > 4 ? `${clean.slice(0, 3)}•••••${clean.slice(-2)}` : '••••';
  }

  get idNumber(): string {
    if (this.isSampleAppointment) return this.appointment.idNumber || '—';
    if (!this.appointment.idNumber) return '—';
    return `•••••••••${this.appointment.idNumber.slice(-4)}`;
  }

  statusClass(): string {
    return this.appointment.status.toLowerCase().replace('_', '-');
  }
}
