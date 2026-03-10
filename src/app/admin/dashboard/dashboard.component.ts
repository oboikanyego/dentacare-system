import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { AppointmentService } from '../../core/services/appointment.service';
import { UsersService } from '../../core/services/users.service';
import { Appointment } from '../../core/models/appointment.model';
import { UserListItem } from '../../core/models/user.model';

@Component({
  selector: 'app-admin-dashboard-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  private readonly appointmentService = inject(AppointmentService);
  private readonly usersService = inject(UsersService);

  isLoading = true;
  errorMessage = '';
  appointments: Appointment[] = [];
  users: UserListItem[] = [];

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.appointmentService.listStaffAppointments().subscribe({
      next: (appointments) => {
        this.appointments = appointments;
        this.usersService.list().subscribe({
          next: (users) => { this.users = users; },
          error: (error) => { this.errorMessage = error?.error?.message || 'Unable to load dashboard'; },
          complete: () => { this.isLoading = false; }
        });
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Unable to load dashboard';
        this.isLoading = false;
      }
    });
  }

  get todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }

  get bookingsToday(): number { return this.appointments.filter(a => a.date === this.todayIso).length; }
  get pendingCount(): number { return this.appointments.filter(a => a.status === 'PENDING').length; }
  get cancelledCount(): number { return this.appointments.filter(a => a.status === 'CANCELLED').length; }
  get completedCount(): number { return this.appointments.filter(a => a.status === 'COMPLETED').length; }
  get activeUsers(): number { return this.users.filter(u => u.isActive).length; }
}
