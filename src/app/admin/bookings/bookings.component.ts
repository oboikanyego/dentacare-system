import { CommonModule, DatePipe } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EMPTY, finalize, switchMap } from 'rxjs';
import { Appointment } from '../../core/models/appointment.model';
import { MasterDataItem } from '../../core/models/master-data.model';
import { TreatmentNote } from '../../core/models/treatment-note.model';
import { AppointmentService } from '../../core/services/appointment.service';
import { AuthService } from '../../core/services/auth.service';
import { MasterDataService } from '../../core/services/master-data.service';
import { TreatmentNoteService } from '../../core/services/treatment-note.service';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';
import { AppointmentEditDialogComponent } from '../../shared/components/appointment-edit-dialog/appointment-edit-dialog.component';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { StaffBookingDialogComponent } from '../../shared/components/staff-booking-dialog/staff-booking-dialog.component';
import { TreatmentNoteDialogComponent } from '../../shared/components/treatment-note-dialog/treatment-note-dialog.component';

@Component({
  selector: 'app-bookings-page',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule, MatDialogModule],
  templateUrl: './bookings.component.html',
  styleUrl: './bookings.component.css'
})
export class BookingsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly appointmentService = inject(AppointmentService);
  private readonly masterDataService = inject(MasterDataService);
  private readonly treatmentNoteService = inject(TreatmentNoteService);
  private readonly authService = inject(AuthService);
  private readonly dialog = inject(MatDialog);
  private readonly uiFeedback = inject(UiFeedbackService);

  private readonly currentUser = this.authService.currentUser;
  readonly isDentist = computed(() => this.currentUser()?.role === 'DENTIST');

  private readonly allAppointments = signal<Appointment[]>([]);

  readonly todaySchedule = computed(() => {
    if (!this.isDentist()) return [];
    const today = new Date().toISOString().slice(0, 10);
    const name = this.currentUser()?.name?.toLowerCase() ?? '';
    return this.allAppointments()
      .filter(
        (a) =>
          a.date === today &&
          !['CANCELLED', 'NO_SHOW'].includes(a.status) &&
          (a.dentistName ?? '').toLowerCase().includes(name)
      )
      .sort((a, b) => a.time.localeCompare(b.time));
  });

  appointments: Appointment[] = [];
  filteredAppointments: Appointment[] = [];
  timeSlots: MasterDataItem[] = [];
  branches: MasterDataItem[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  searchTerm = '';
  statusFilter = 'ALL';
  branchFilter = 'ALL';
  dentistFilter = 'ALL';
  dateFrom = '';
  dateTo = '';
  sortKey: 'date' | 'patientName' | 'status' = 'date';

  get dentistOptions(): string[] {
    const names = new Set<string>();
    for (const a of this.appointments) {
      if (a.dentistName) names.add(a.dentistName);
    }
    return [...names].sort();
  }
  page = 1;
  readonly pageSize = 10;
  selectedAppointment: Appointment | null = null;
  detailTab: 'details' | 'history' = 'details';
  readonly patientNotes = signal<TreatmentNote[]>([]);
  readonly patientNotesLoading = signal(false);

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

    this.masterDataService
      .getOne('branches')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.branches = (response.items || []).filter((b) => b.isActive !== false);
        },
        error: () => {
          this.branches = [];
        }
      });

    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.appointmentService
      .listStaffAppointments()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (appointments) => {
          this.appointments = appointments;
          this.allAppointments.set(appointments);
          this.applyFilters();
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Unable to load appointments';
          this.uiFeedback.error(this.errorMessage);
        }
      });
  }

  clearDateFilter(): void {
    this.dateFrom = '';
    this.dateTo = '';
    this.applyFilters();
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredAppointments = this.appointments
      .filter((appointment) => {
        const matchesStatus =
          this.statusFilter === 'ALL' || appointment.status === this.statusFilter;
        const matchesBranch =
          this.branchFilter === 'ALL' || appointment.branchName === this.branchFilter;
        const matchesDentist =
          this.dentistFilter === 'ALL' || appointment.dentistName === this.dentistFilter;
        const matchesDateFrom = !this.dateFrom || appointment.date >= this.dateFrom;
        const matchesDateTo = !this.dateTo || appointment.date <= this.dateTo;
        const haystack = [
          appointment.patientName,
          appointment.idNumber,
          appointment.email,
          appointment.serviceName,
          appointment.branchName,
          appointment.dentistName,
          appointment.date,
          appointment.time,
          appointment.phone
        ]
          .join(' ')
          .toLowerCase();

        return (
          matchesStatus &&
          matchesBranch &&
          matchesDentist &&
          matchesDateFrom &&
          matchesDateTo &&
          (!term || haystack.includes(term))
        );
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
    this.selectedAppointment = { ...appointment };
    this.detailTab = 'details';
    this.patientNotes.set([]);
  }

  closeDetails(): void {
    this.selectedAppointment = null;
    this.patientNotes.set([]);
  }

  switchDetailTab(tab: 'details' | 'history'): void {
    this.detailTab = tab;
    if (tab === 'history' && this.selectedAppointment?.email && !this.patientNotes().length) {
      this.loadPatientHistory(this.selectedAppointment.email);
    }
  }

  loadPatientHistory(email: string): void {
    this.patientNotesLoading.set(true);
    this.treatmentNoteService
      .listByEmail(email)
      .pipe(
        finalize(() => this.patientNotesLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (notes) => this.patientNotes.set(notes),
        error: () => this.patientNotes.set([])
      });
  }

  cancel(appointment: Appointment): void {
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
          confirmed ? this.appointmentService.cancelStaffAppointment(appointmentId) : EMPTY
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
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
  }

  newBooking(): void {
    this.dialog
      .open(StaffBookingDialogComponent, {
        width: '860px',
        maxWidth: '96vw',
        autoFocus: false
      })
      .afterClosed()
      .pipe(
        switchMap((payload) =>
          payload ? this.appointmentService.createStaffAppointment(payload) : EMPTY
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Appointment created successfully';
          this.uiFeedback.success(this.successMessage);
          this.load();
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Unable to create appointment';
          this.uiFeedback.error(this.errorMessage);
        }
      });
  }

  addTreatmentNote(appointment: Appointment): void {
    this.dialog
      .open(TreatmentNoteDialogComponent, {
        data: { appointment },
        width: '680px',
        maxWidth: '96vw',
        autoFocus: false
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  reschedule(appointment: Appointment): void {
    if (!appointment._id) return;

    const appointmentId = appointment._id;

    this.dialog
      .open(AppointmentEditDialogComponent, {
        panelClass: 'appointment-dialog-panel',
        width: '920px',
        maxWidth: '95vw',
        height: '88vh',
        autoFocus: false,
        data: {
          title: 'Edit / reschedule booking',
          appointment,
          timeSlots: this.timeSlots,
          canEditStatus: true,
          canEditInternalNotes: true,
          auditNote: 'Booking updated by staff'
        }
      })
      .afterClosed()
      .pipe(
        switchMap((payload) =>
          payload ? this.appointmentService.updateAppointment(appointmentId, payload) : EMPTY
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
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
  }

  quickStatus(appointment: Appointment, status: Appointment['status']): void {
    if (!appointment._id) return;
    const labels: Partial<Record<Appointment['status'], string>> = {
      CONFIRMED: 'Confirm',
      COMPLETED: 'Mark as completed',
      NO_SHOW: 'Mark as no-show'
    };
    if (!confirm(`${labels[status] ?? status} this appointment?`)) return;
    this.appointmentService
      .updateAppointment(appointment._id, { status })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.uiFeedback.success(
            `Appointment marked as ${status.toLowerCase().replace('_', ' ')}`
          );
          this.load();
        },
        error: (err) => this.uiFeedback.error(err?.error?.message || 'Status update failed')
      });
  }

  statusClass(status: Appointment['status']): string {
    return status.toLowerCase().replace('_', '-');
  }

  canCancel(status: Appointment['status']): boolean {
    return !['CANCELLED', 'COMPLETED', 'NO_SHOW'].includes(status);
  }

  maskName(value?: string | null): string {
    if (!value?.trim()) return 'Patient';
    return value
      .trim()
      .split(/\s+/)
      .map((part) => `${part.charAt(0)}•••`)
      .join(' ');
  }

  maskEmail(value?: string | null): string {
    if (!value) return '—';
    const [local] = value.split('@');
    return `${local?.charAt(0) || '•'}•••@•••`;
  }

  maskPhone(value?: string | null): string {
    if (!value) return '—';
    const clean = value.replace(/\s+/g, '');
    return clean.length > 4 ? `${clean.slice(0, 3)}•••••${clean.slice(-2)}` : '••••';
  }

  exportCsv(): void {
    const headers = [
      'Patient',
      'Service',
      'Branch',
      'Dentist',
      'Date',
      'Time',
      'Status',
      'Duration (min)',
      'Reason',
      'Notes'
    ];
    const rows = this.filteredAppointments.map((a) => [
      a.patientName ?? '',
      a.serviceName ?? '',
      a.branchName ?? '',
      a.dentistName ?? '',
      a.date ?? '',
      a.time ?? '',
      a.status ?? '',
      String(a.durationMinutes ?? 30),
      a.reason ?? '',
      a.notes ?? ''
    ]);

    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\r\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    const datePart = this.dateFrom && this.dateTo ? `_${this.dateFrom}_to_${this.dateTo}` : '';
    anchor.download = `bookings${datePart}_${new Date().toISOString().slice(0, 10)}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  previousPage(): void {
    this.page = Math.max(1, this.page - 1);
  }

  nextPage(): void {
    this.page = Math.min(this.totalPages, this.page + 1);
  }
}
