import { Injectable, signal } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class UiFeedbackService {
  readonly welcomeMessage = signal<string | null>(null);

  constructor(private readonly snackBar: MatSnackBar) {}

  success(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['app-snackbar-success']
    });
  }

  error(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 4200,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['app-snackbar-error']
    });
  }

  showWelcome(name?: string | null): void {
    this.welcomeMessage.set(name ? `Welcome back, ${name}` : 'Welcome to DentaCare');
    setTimeout(() => this.welcomeMessage.set(null), 2400);
  }
}
