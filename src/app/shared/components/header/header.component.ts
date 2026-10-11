import { CommonModule } from '@angular/common';
import {
  Component,
  DestroyRef,
  HostListener,
  OnInit,
  computed,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { switchMap, timer } from 'rxjs';
import { AppNotification } from '../../../core/models/notification.model';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly notificationService = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly router = inject(Router);

  readonly menuOpen = signal(false);
  readonly profileOpen = signal(false);
  readonly notifOpen = signal(false);
  readonly notifications = signal<AppNotification[]>([]);
  readonly user = this.authService.currentUser;

  readonly unreadCount = computed(() => this.notifications().filter((n) => !n.isRead).length);

  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      timer(0, 30_000)
        .pipe(
          switchMap(() => this.notificationService.list()),
          takeUntilDestroyed(this.destroyRef)
        )
        .subscribe({
          next: (data) => this.notifications.set(data),
          error: () => {}
        });
    }
  }

  toggleMenu(): void {
    this.menuOpen.update((value) => !value);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  toggleProfile(): void {
    this.notifOpen.set(false);
    this.profileOpen.update((value) => !value);
  }

  closeProfile(): void {
    this.profileOpen.set(false);
  }

  toggleNotif(): void {
    this.profileOpen.set(false);
    this.notifOpen.update((value) => !value);
  }

  closeNotif(): void {
    this.notifOpen.set(false);
  }

  markAllRead(): void {
    if (this.unreadCount() === 0) return;
    this.notificationService.markAllRead().subscribe({
      next: () => this.notifications.update((list) => list.map((n) => ({ ...n, isRead: true })))
    });
  }

  onNotifClick(notif: AppNotification): void {
    if (!notif.isRead && notif._id) {
      this.notificationService.markRead(notif._id).subscribe({
        next: () =>
          this.notifications.update((list) =>
            list.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
          )
      });
    }
    if (notif.appointmentId) {
      this.closeNotif();
      const route = this.isPatient() ? '/patient/appointments' : '/staff/bookings';
      this.router.navigateByUrl(route);
    } else if (notif.type === 'INVOICE_CREATED') {
      this.closeNotif();
      this.router.navigateByUrl(this.isPatient() ? '/patient/invoices' : '/admin/billing');
    } else if (notif.type === 'TREATMENT_NOTE_CREATED') {
      this.closeNotif();
      this.router.navigateByUrl('/patient/treatment-history');
    }
  }

  logout(): void {
    this.authService.logout();
    this.closeMenu();
    this.closeProfile();
    this.closeNotif();
    this.notifications.set([]);
    this.router.navigateByUrl('/');
  }

  goToProfileArea(): void {
    const target = this.authService.getLandingRoute();
    this.closeProfile();
    this.closeMenu();
    this.router.navigateByUrl(target);
  }

  isStaff(): boolean {
    return this.authService.hasRole(['RECEPTIONIST', 'DENTIST', 'ADMIN']);
  }

  isAdmin(): boolean {
    return this.authService.hasRole(['ADMIN']);
  }

  isPatient(): boolean {
    return this.authService.hasRole(['PATIENT']);
  }

  isDentist(): boolean {
    return this.authService.hasRole(['DENTIST']);
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.profileOpen()) {
      this.profileOpen.set(false);
    }
    if (this.notifOpen()) {
      this.notifOpen.set(false);
    }
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}
