import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EMPTY, finalize, switchMap } from 'rxjs';
import { Appointment } from '../../core/models/appointment.model';
import { AppointmentService } from '../../core/services/appointment.service';
import { TreatmentNoteService } from '../../core/services/treatment-note.service';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';
import { TreatmentNoteDialogComponent } from '../../shared/components/treatment-note-dialog/treatment-note-dialog.component';

export interface DentistGroup {
  dentistName: string;
  slots: Appointment[];
}

type QuickStatus = 'CONFIRMED' | 'COMPLETED' | 'NO_SHOW';

@Component({
  selector: 'app-today',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './today.component.html',
  styleUrl: './today.component.css'
})
export class TodayComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly appointmentService = inject(AppointmentService);
  private readonly treatmentNoteService = inject(TreatmentNoteService);
  private readonly dialog = inject(MatDialog);
  private readonly uiFeedback = inject(UiFeedbackService);

  private readonly allAppointments = signal<Appointment[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly notedAppointmentIds = signal<Set<string>>(new Set());
  readonly updatingId = signal<string | null>(null);

  readonly today = new Date().toISOString().slice(0, 10);
  readonly todayLabel = new Date().toLocaleDateString('en-ZA', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  private readonly todayAppts = computed((): Appointment[] =>
    this.allAppointments()
      .filter((a) => a.date === this.today)
      .sort((a, b) => a.time.localeCompare(b.time))
  );

  readonly groups = computed((): DentistGroup[] => {
    const map = new Map<string, Appointment[]>();
    for (const a of this.todayAppts()) {
      const key = a.dentistName || 'Unassigned';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dentistName, slots]) => ({ dentistName, slots }));
  });

  readonly kpiTotal = computed(() => this.todayAppts().length);
  readonly kpiConfirmed = computed(
    () => this.todayAppts().filter((a) => a.status === 'CONFIRMED').length
  );
  readonly kpiPending = computed(
    () => this.todayAppts().filter((a) => a.status === 'PENDING').length
  );
  readonly kpiCompleted = computed(
    () => this.todayAppts().filter((a) => a.status === 'COMPLETED').length
  );
  readonly kpiNoShow = computed(
    () => this.todayAppts().filter((a) => ['NO_SHOW', 'CANCELLED'].includes(a.status)).length
  );

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.appointmentService
      .listStaffAppointments()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (data) => {
          this.allAppointments.set(data);
          this.loadTodaysNotes();
        },
        error: (err) => {
          const msg = err?.error?.message || 'Unable to load appointments';
          this.errorMessage.set(msg);
          this.uiFeedback.error(msg);
        }
      });
  }

  private loadTodaysNotes(): void {
    this.treatmentNoteService
      .getTodaysNotes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (notes) => {
          const ids = new Set(notes.map((n) => String(n.appointmentId)));
          this.notedAppointmentIds.set(ids);
        },
        error: () => {}
      });
  }

  addTreatmentNote(appt: Appointment): void {
    if (!appt._id) return;
    this.dialog
      .open(TreatmentNoteDialogComponent, {
        width: '600px',
        maxWidth: '96vw',
        data: { appointment: appt }
      })
      .afterClosed()
      .pipe(
        switchMap((note) => {
          if (note && appt._id) {
            this.notedAppointmentIds.update((ids) => new Set([...ids, appt._id!]));
          }
          return EMPTY;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }

  hasNote(apptId: string | undefined): boolean {
    return !!apptId && this.notedAppointmentIds().has(apptId);
  }

  canAddNote(appt: Appointment): boolean {
    return (
      !!appt._id && ['CONFIRMED', 'COMPLETED'].includes(appt.status) && !this.hasNote(appt._id)
    );
  }

  quickUpdate(appt: Appointment, newStatus: QuickStatus): void {
    if (!appt._id || this.updatingId()) return;
    this.updatingId.set(appt._id);
    this.appointmentService
      .updateAppointment(appt._id, { status: newStatus, auditNote: `Status set to ${newStatus}` })
      .pipe(
        finalize(() => this.updatingId.set(null)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({ appointment }) => {
          this.allAppointments.update((list) =>
            list.map((a) => (a._id === appt._id ? appointment : a))
          );
          this.uiFeedback.success(`Marked ${newStatus.toLowerCase().replace('_', '-')}`);
        },
        error: (err) => {
          const msg = err?.error?.message || 'Update failed';
          this.uiFeedback.error(msg);
        }
      });
  }

  canConfirm(status: Appointment['status']): boolean {
    return status === 'PENDING';
  }

  canComplete(status: Appointment['status']): boolean {
    return status === 'CONFIRMED' || status === 'PENDING';
  }

  canNoShow(status: Appointment['status']): boolean {
    return status === 'CONFIRMED' || status === 'PENDING';
  }

  statusClass(status: Appointment['status']): string {
    return status.toLowerCase().replace('_', '-');
  }

  maskName(value?: string | null): string {
    if (!value?.trim()) return 'Patient';
    return value
      .trim()
      .split(/\s+/)
      .map((part) => `${part.charAt(0)}•••`)
      .join(' ');
  }
}
