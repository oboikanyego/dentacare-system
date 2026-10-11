import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Appointment } from '../../core/models/appointment.model';
import { AppointmentService } from '../../core/services/appointment.service';
import { AuthService } from '../../core/services/auth.service';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';

export interface ScheduleDay {
  dateIso: string;
  label: string;
  slots: Appointment[];
}

type StatusFilter = 'ALL' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';

@Component({
  selector: 'app-my-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-schedule.component.html',
  styleUrl: './my-schedule.component.css'
})
export class MyScheduleComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly appointmentService = inject(AppointmentService);
  private readonly authService = inject(AuthService);
  private readonly uiFeedback = inject(UiFeedbackService);

  private readonly allAppointments = signal<Appointment[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  statusFilter: StatusFilter = 'ALL';
  expandedId = signal<string | null>(null);

  private get dentistName(): string {
    return this.authService.currentUser()?.name ?? '';
  }

  private readonly mine = computed((): Appointment[] =>
    this.allAppointments().filter(
      (a) => a.dentistName?.toLowerCase() === this.dentistName.toLowerCase()
    )
  );

  private readonly filtered = computed((): Appointment[] => {
    if (this.statusFilter === 'ALL') return this.mine();
    return this.mine().filter((a) => a.status === this.statusFilter);
  });

  readonly today = new Date().toISOString().slice(0, 10);

  readonly todaySlots = computed((): Appointment[] =>
    this.filtered()
      .filter((a) => a.date === this.today)
      .sort((a, b) => a.time.localeCompare(b.time))
  );

  readonly upcomingDays = computed((): ScheduleDay[] => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + 14);
    const end = cutoff.toISOString().slice(0, 10);

    const map = new Map<string, Appointment[]>();
    for (const a of this.filtered()) {
      if (a.date > this.today && a.date <= end) {
        if (!map.has(a.date)) map.set(a.date, []);
        map.get(a.date)!.push(a);
      }
    }
    const days: ScheduleDay[] = [];
    for (const [dateIso, slots] of [...map.entries()].sort(([a], [b]) => a.localeCompare(b))) {
      days.push({
        dateIso,
        label: this.formatDayLabel(dateIso),
        slots: slots.sort((a, b) => a.time.localeCompare(b.time))
      });
    }
    return days;
  });

  readonly kpiTotal = computed(
    () =>
      this.mine().filter(
        (a) => a.date === this.today && !['CANCELLED', 'NO_SHOW'].includes(a.status)
      ).length
  );

  readonly kpiUpcomingWeek = computed((): number => {
    const weekEnd = new Date();
    weekEnd.setDate(weekEnd.getDate() + 7);
    const end = weekEnd.toISOString().slice(0, 10);
    return this.mine().filter(
      (a) => a.date > this.today && a.date <= end && !['CANCELLED', 'NO_SHOW'].includes(a.status)
    ).length;
  });

  readonly kpiCompletedMonth = computed((): number => {
    const monthStart = this.today.slice(0, 7) + '-01';
    return this.mine().filter(
      (a) => a.status === 'COMPLETED' && a.date >= monthStart && a.date <= this.today
    ).length;
  });

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
        next: (data) => this.allAppointments.set(data),
        error: (err) => {
          const msg = err?.error?.message || 'Unable to load schedule';
          this.errorMessage.set(msg);
          this.uiFeedback.error(msg);
        }
      });
  }

  toggleExpand(id: string): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
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

  private formatDayLabel(iso: string): string {
    const d = new Date(iso + 'T00:00:00');
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    if (iso === tomorrow.toISOString().slice(0, 10)) return 'Tomorrow';
    return d.toLocaleDateString('en-ZA', { weekday: 'long', month: 'short', day: 'numeric' });
  }
}
