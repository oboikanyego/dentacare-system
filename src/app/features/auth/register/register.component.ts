import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AuthService } from '../../../core/services/auth.service';
import { UiFeedbackService } from '../../../core/services/ui-feedback.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly uiFeedback = inject(UiFeedbackService);

  isSubmitting = false;
  errorMessage = '';
  hidePassword = true;
  hideConfirmPassword = true;

  readonly form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.pattern(/^(?:\+27|0)[6-8][0-9]{8}$/)]],
    idNumber: ['', [Validators.required, Validators.pattern(/^\d{13}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
  }, { validators: passwordMatchValidator });

  get f() {
    return this.form.controls;
  }

  get passwordScore(): number {
    const value = this.form.get('password')?.value || '';
    let score = 0;
    if (value.length >= 8) score++;
    if (/[A-Z]/.test(value)) score++;
    if (/[a-z]/.test(value)) score++;
    if (/\d/.test(value)) score++;
    if (/[^A-Za-z0-9]/.test(value)) score++;
    return Math.min(score * 20, 100);
  }

  get passwordStrength(): string {
    if (this.passwordScore <= 40) return 'Weak';
    if (this.passwordScore <= 80) return 'Medium';
    return 'Strong';
  }

  submit(): void {
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { confirmPassword, ...payload } = this.form.getRawValue();

    this.isSubmitting = true;
    this.authService.register(payload as never).subscribe({
      next: () => {
        this.uiFeedback.success('Account created successfully.');
        this.uiFeedback.showWelcome(this.authService.getCurrentUser()?.name);
        this.router.navigateByUrl('/patient/appointments');
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Unable to register';
        this.isSubmitting = false;
      },
      complete: () => {
        this.isSubmitting = false;
      }
    });
  }

  togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPassword(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }

  getErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (!field?.errors || !(field.touched || field.dirty)) return '';
    if (field.errors['required']) return 'This field is required.';
    if (field.errors['email']) return 'Enter a valid email address.';
    if (field.errors['minlength']) return 'Value is too short.';
    if (field.errors['pattern']) {
      if (fieldName === 'phone') return 'Use a valid South African mobile number.';
      if (fieldName === 'idNumber') return 'Enter a valid 13-digit ID number.';
    }
    return 'Check this field.';
  }
}
