import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EMPTY, finalize, switchMap } from 'rxjs';
import { Appointment } from '../../core/models/appointment.model';
import { MasterDataItem } from '../../core/models/master-data.model';
import { AppointmentService } from '../../core/services/appointment.service';
import { MasterDataService } from '../../core/services/master-data.service';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';
import { AppointmentEditDialogComponent } from '../../shared/components/appointment-edit-dialog/appointment-edit-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-patient-appointments',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './patient-appointments.component.html',
  styleUrls: ['./patient-appointments.component.css']
})
export class PatientAppointmentsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly appointmentService = inject(AppointmentService);
  private readonly masterDataService = inject(MasterDataService);
  private readonly dialog = inject(MatDialog);
  private readonly uiFeedback = inject(UiFeedbackService);

  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  timeSlots: MasterDataItem[] = [];
  loading = false;
  message = '';
  errorMessage = '';
  searchTerm = '';
  statusFilter = 'ALL';
  sortKey: 'date' | 'serviceName' | 'status' = 'date';
  page = 1;
  readonly pageSize = 8;
  selectedAppointment: Appointment | null = null;

  ngOnInit(): void {
    this.masterDataService
      .getOne('timeSlots')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.timeSlots = response.items || [];
        },
        error: () => {
          this.timeSlots = [];
        }
      });

    this.loadAppointments();
  }

  loadAppointments(): void {
    this.loading = true;
    this.errorMessage = '';

    this.appointmentService
      .listMyAppointments()
      .pipe(
        finalize(() => {
          this.loading = false;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (appointments) => {
          this.appointments = appointments;
          this.applyFilters();
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Unable to load appointments';
          this.uiFeedback.error(this.errorMessage);
        }
      });
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredAppointments = this.appointments
      .filter((appointment) => {
        const matchesStatus =
          this.statusFilter === 'ALL' || appointment.status === this.statusFilter;
        const haystack = [
          appointment.serviceName,
          appointment.dentistName,
          appointment.branchName,
          appointment.date,
          appointment.time,
          appointment.reason,
          appointment.notes
        ]
          .join(' ')
          .toLowerCase();
        const matchesSearch = !term || haystack.includes(term);

        return matchesStatus && matchesSearch;
      })
      .sort((a, b) => String(a[this.sortKey] || '').localeCompare(String(b[this.sortKey] || '')));

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
    this.selectedAppointment = appointment;
  }

  closeDetails(): void {
    this.selectedAppointment = null;
  }

  cancelAppointment(appointment: Appointment): void {
    if (!appointment._id) return;

    const appointmentId = appointment._id;

    this.dialog
      .open(ConfirmDialogComponent, {
        width: '420px',
        data: {
          title: 'Cancel appointment',
          message: 'Are you sure you want to cancel this appointment?',
          confirmText: 'Yes, cancel'
        }
      })
      .afterClosed()
      .pipe(
        switchMap((confirmed) =>
          confirmed ? this.appointmentService.cancelMyAppointment(appointmentId) : EMPTY
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.message = 'Appointment cancelled successfully';
          this.uiFeedback.success(this.message);
          this.closeDetails();
          this.loadAppointments();
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Unable to cancel appointment';
          this.uiFeedback.error(this.errorMessage);
        }
      });
  }

  rescheduleAppointment(appointment: Appointment): void {
    if (!appointment._id) return;

    const appointmentId = appointment._id;

    this.dialog
      .open(AppointmentEditDialogComponent, {
        width: '640px',
        maxWidth: '96vw',
        data: {
          title: 'Reschedule appointment',
          appointment,
          timeSlots: this.timeSlots,
          auditNote: 'Rescheduled by patient'
        }
      })
      .afterClosed()
      .pipe(
        switchMap((payload) =>
          payload ? this.appointmentService.updateMyAppointment(appointmentId, payload) : EMPTY
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.message = 'Appointment rescheduled successfully';
          this.uiFeedback.success(this.message);
          this.closeDetails();
          this.loadAppointments();
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Unable to reschedule appointment';
          this.uiFeedback.error(this.errorMessage);
        }
      });
  }

  statusClass(status: Appointment['status']): string {
    return status.toLowerCase().replace('_', '-');
  }

  canCancel(status: Appointment['status']): boolean {
    return !['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(status);
  }

  previousPage(): void {
    this.page = Math.max(1, this.page - 1);
  }

  nextPage(): void {
    this.page = Math.min(this.totalPages, this.page + 1);
  }
}
