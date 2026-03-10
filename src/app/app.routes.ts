import { Routes } from '@angular/router';
import { AboutComponent } from './pages/about/about.component';
import { BookingsComponent } from './admin/bookings/bookings.component';
import { DashboardComponent } from './admin/dashboard/dashboard.component';
import { UsersComponent } from './admin/users/users.component';
import { AppointmentComponent } from './pages/appointment/appointment.component';
import { ContactComponent } from './pages/contact/contact.component';
import { HomeComponent } from './pages/home/home.component';
import { ServicesComponent } from './pages/services/services.component';
import { LoginComponent } from './features/auth/login/login.component';
import { RegisterComponent } from './features/auth/register/register.component';
import { ForgotPasswordComponent } from './features/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './features/auth/reset-password/reset-password.component';
import { PatientAppointmentsComponent } from './patient/appointments/patient-appointments.component';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent, title: 'DentaCare | Home' },
  { path: 'login', component: LoginComponent, title: 'DentaCare | Login' },
  { path: 'register', component: RegisterComponent, title: 'DentaCare | Register' },
  { path: 'forgot-password', component: ForgotPasswordComponent, title: 'DentaCare | Forgot Password' },
  { path: 'reset-password', component: ResetPasswordComponent, title: 'DentaCare | Reset Password' },
  { path: 'about', component: AboutComponent, title: 'DentaCare | About' },
  { path: 'services', component: ServicesComponent, title: 'DentaCare | Services' },
  { path: 'contact', component: ContactComponent, title: 'DentaCare | Contact' },
  { path: 'appointment', component: AppointmentComponent, title: 'DentaCare | Appointment' },
  {
    path: 'patient/appointments',
    component: PatientAppointmentsComponent,
    title: 'DentaCare | My Appointments',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['PATIENT'] }
  },
  {
    path: 'staff/bookings',
    component: BookingsComponent,
    title: 'DentaCare | Staff Bookings',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['RECEPTIONIST', 'DENTIST', 'ADMIN'] }
  },
  {
    path: 'admin/dashboard',
    component: DashboardComponent,
    title: 'DentaCare | Admin Dashboard',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'admin/users',
    component: UsersComponent,
    title: 'DentaCare | User Management',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] }
  },
  { path: '**', redirectTo: '' }
];
