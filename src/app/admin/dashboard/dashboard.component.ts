import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin } from 'rxjs';
import { Appointment } from '../../core/models/appointment.model';
import { UserListItem } from '../../core/models/user.model';
import { AppointmentService } from '../../core/services/appointment.service';
import { UsersService } from '../../core/services/users.service';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly appointmentService = inject(AppointmentService);
  private readonly usersService = inject(UsersService);

  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  readonly appointments = signal<Appointment[]>([]);
  readonly users = signal<UserListItem[]>([]);

  private readonly todayIso = new Date().toISOString().slice(0, 10);

  readonly bookingsToday = computed(
    () => this.appointments().filter((appointment) => appointment.date === this.todayIso).length
  );
  readonly pendingCount = computed(
    () => this.appointments().filter((appointment) => appointment.status === 'PENDING').length
  );
  readonly cancelledCount = computed(
    () => this.appointments().filter((appointment) => appointment.status === 'CANCELLED').length
  );
  readonly completedCount = computed(
    () => this.appointments().filter((appointment) => appointment.status === 'COMPLETED').length
  );
  readonly confirmedCount = computed(
    () => this.appointments().filter((appointment) => appointment.status === 'CONFIRMED').length
  );
  readonly noShowCount = computed(
    () => this.appointments().filter((appointment) => appointment.status === 'NO_SHOW').length
  );
  readonly activeUsers = computed(() => this.users().filter((user) => user.isActive).length);

  readonly totalAppointments = computed(() => this.appointments().length);

  readonly statusBars = computed(() => {
    const total = this.totalAppointments();
    if (total === 0) return [];
    const statuses = [
      { label: 'Confirmed', count: this.confirmedCount(), color: '#22c55e' },
      { label: 'Pending', count: this.pendingCount(), color: '#f59e0b' },
      { label: 'Completed', count: this.completedCount(), color: '#3b82f6' },
      { label: 'Cancelled', count: this.cancelledCount(), color: '#ef4444' },
      { label: 'No show', count: this.noShowCount(), color: '#a855f7' }
    ];
    return statuses.map((s) => ({ ...s, pct: Math.round((s.count / total) * 100) }));
  });

  readonly recentAppointments = computed(() =>
    [...this.appointments()]
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
      .slice(0, 5)
  );

  readonly upcomingCount = computed(() => {
    const today = this.todayIso;
    const in7 = new Date();
    in7.setDate(in7.getDate() + 7);
    const in7Iso = in7.toISOString().slice(0, 10);
    return this.appointments().filter(
      (a) => a.date >= today && a.date <= in7Iso && !['CANCELLED', 'NO_SHOW'].includes(a.status)
    ).length;
  });

  readonly trend7 = computed(() => {
    const days: { label: string; iso: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      days.push({
        label: d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        iso,
        count: 0
      });
    }
    for (const appt of this.appointments()) {
      const slot = days.find((d) => d.iso === appt.date);
      if (slot) slot.count++;
    }
    const max = Math.max(1, ...days.map((d) => d.count));
    return days.map((d) => ({ ...d, pct: Math.round((d.count / max) * 100) }));
  });

  readonly topServices = computed(() => {
    const map = new Map<string, number>();
    for (const appt of this.appointments()) {
      if (appt.serviceName) {
        map.set(appt.serviceName, (map.get(appt.serviceName) ?? 0) + 1);
      }
    }
    const total = this.totalAppointments() || 1;
    return [...map.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }));
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    forkJoin({
      appointments: this.appointmentService.listStaffAppointments(),
      users: this.usersService.list()
    })
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({ appointments, users }) => {
          this.appointments.set(appointments);
          this.users.set(users);
        },
        error: (error) => {
          this.errorMessage.set(error?.error?.message || 'Unable to load dashboard');
        }
      });
  }
}
