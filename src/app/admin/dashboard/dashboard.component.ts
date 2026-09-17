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
  readonly activeUsers = computed(() => this.users().filter((user) => user.isActive).length);

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
