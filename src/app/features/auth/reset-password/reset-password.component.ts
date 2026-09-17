import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';

function passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirmPassword = control.get('confirmPassword')?.value;

  if (!password || !confirmPassword) {
    return null;
  }

  return password === confirmPassword ? null : { passwordMismatch: true };
}

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export class ResetPasswordComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  hidePassword = true;
  hideConfirmPassword = true;
  isSubmitting = false;
  message = '';
  errorMessage = '';

  readonly form = this.fb.group(
    {
      email: [
        this.route.snapshot.queryParamMap.get('email') || '',
        [Validators.required, Validators.email]
      ],
      otp: ['', [Validators.required, Validators.minLength(6)]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, Validators.minLength(6)]]
    },
    { validators: passwordMatchValidator }
  );

  submit(): void {
    this.message = '';
    this.errorMessage = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { confirmPassword, ...payload } = this.form.getRawValue();
    void confirmPassword;

    this.isSubmitting = true;
    this.authService
      .resetPassword(payload as never)
      .pipe(
        finalize(() => {
          this.isSubmitting = false;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response) => {
          this.message = response.message;
          this.router.navigateByUrl('/login');
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Unable to reset password';
        }
      });
  }

  togglePassword(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPassword(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }
}
