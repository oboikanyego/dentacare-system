import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  readonly menuOpen = signal(false);
  readonly profileOpen = signal(false);
  readonly user = this.authService.currentUser;

  toggleMenu(): void {
    this.menuOpen.update((value) => !value);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  toggleProfile(): void {
    this.profileOpen.update((value) => !value);
  }

  closeProfile(): void {
    this.profileOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
    this.closeMenu();
    this.closeProfile();
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

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.profileOpen()) {
      this.profileOpen.set(false);
    }
  }

  stopPropagation(event: Event): void {
    event.stopPropagation();
  }
}
