import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AppointmentService } from '../../core/services/appointment.service';
import { Appointment } from '../../core/models/appointment.model';
import { MasterDataService } from '../../core/services/master-data.service';
import { MasterDataItem } from '../../core/models/master-data.model';
import { AppointmentEditDialogComponent } from '../../shared/components/appointment-edit-dialog/appointment-edit-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';

@Component({
  selector: 'app-bookings-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.css'
})
export class BookingsComponent implements OnInit {
  private readonly appointmentService = inject(AppointmentService);
  private readonly masterDataService = inject(MasterDataService);
  private readonly dialog = inject(MatDialog);
  private readonly uiFeedback = inject(UiFeedbackService);

  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  timeSlots: MasterDataItem[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  searchTerm = '';
  statusFilter = 'ALL';
  sortKey: 'date' | 'patientName' | 'status' = 'date';
  page = 1;
  readonly pageSize = 10;
  selectedAppointment: Appointment | null = null;

  ngOnInit(): void {
    this.masterDataService.getOne('timeSlots').subscribe({ next: (response) => this.timeSlots = response.items || [] });
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.appointmentService.listStaffAppointments().subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.applyFilters();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Unable to load appointments';
        this.uiFeedback.error(this.errorMessage);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredAppointments = this.appointments.filter((appointment) => {
      const matchesStatus = this.statusFilter === 'ALL' || appointment.status === this.statusFilter;
      const haystack = [appointment.patientName, appointment.idNumber, appointment.email, appointment.serviceName, appointment.branchName, appointment.dentistName, appointment.date, appointment.time, appointment.phone]
        .join(' ')
        .toLowerCase();
      return matchesStatus && (!term || haystack.includes(term));
    }).sort((a, b) => String(a[this.sortKey] || '').localeCompare(String(b[this.sortKey] || '')));
    this.page = 1;
  }

  get pagedAppointments(): Appointment[] {
    const start = (this.page - 1) * this.pageSize;
    return this.filteredAppointments.slice(start, start + this.pageSize);
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredAppointments.length / this.pageSize));
  }

  openDetails(appointment: Appointment): void {
    this.selectedAppointment = { ...appointment };
  }

  closeDetails(): void {
    this.selectedAppointment = null;
  }

  cancel(appointment: Appointment): void {
    if (!appointment._id) return;

    this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      data: {
        title: 'Cancel appointment',
        message: 'Are you sure you want to cancel this appointment for this patient?',
        confirmText: 'Yes, cancel'
      }
    }).afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.appointmentService.cancelStaffAppointment(appointment._id!).subscribe({
        next: () => {
          this.successMessage = 'Appointment cancelled successfully';
          this.uiFeedback.success(this.successMessage);
          this.closeDetails();
          this.load();
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Unable to cancel appointment';
          this.uiFeedback.error(this.errorMessage);
        }
      });
    });
  }

  saveDetails(): void {}

  reschedule(appointment: Appointment): void {
    this.dialog.open(AppointmentEditDialogComponent,{
  panelClass: 'appointment-dialog-panel',
  width: '920px',
  maxWidth: '95vw',
  height: '88vh',
  autoFocus: false,
  data: {
    title: 'Edit / reschedule booking',
    timeSlots: this.timeSlots,
    canEditStatus: true,
    canEditInternalNotes: true
  }
}).afterClosed().subscribe((payload) => {
      if (!payload || !appointment._id) return;
      this.appointmentService.updateAppointment(appointment._id, payload).subscribe({
        next: () => {
          this.successMessage = 'Appointment updated successfully';
          this.uiFeedback.success(this.successMessage);
          this.load();
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Unable to update appointment';
          this.uiFeedback.error(this.errorMessage);
        }
      });
    });
  }

  statusClass(status: Appointment['status']): string {
    return status.toLowerCase().replace('_', '-');
  }

  canCancel(status: Appointment['status']): boolean {
    return !['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(status);
  }

  previousPage(): void { this.page = Math.max(1, this.page - 1); }
  nextPage(): void { this.page = Math.min(this.totalPages, this.page + 1); }
}
