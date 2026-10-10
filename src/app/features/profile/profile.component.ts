import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css'
})
export class ProfileComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly uiFeedback = inject(UiFeedbackService);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(false);
  readonly successMessage = signal('');
  readonly errorMessage = signal('');
  readonly user = this.authService.currentUser;

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    phone: ['', [Validators.pattern(/^(?:\+27|0)[6-8][0-9]{8}$/)]]
  });

  ngOnInit(): void {
    const current = this.user();
    if (current) {
      this.form.patchValue({ name: current.name, phone: current.phone ?? '' });
    }
  }

  save(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, phone } = this.form.getRawValue();
    const payload: { name?: string; phone?: string } = {};
    if (name) payload.name = name;
    if (phone) payload.phone = phone;

    this.loading.set(true);
    this.authService
      .updateProfile(payload)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.successMessage.set('Profile updated successfully');
          this.uiFeedback.success('Profile updated successfully');
        },
        error: (err) => {
          const msg = err?.error?.message || 'Unable to update profile';
          this.errorMessage.set(msg);
          this.uiFeedback.error(msg);
        }
      });
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  getFieldError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.errors || !(ctrl.dirty || ctrl.touched)) return '';
    if (ctrl.errors['required']) return 'This field is required.';
    if (ctrl.errors['minlength']) return 'Must be at least 2 characters.';
    if (ctrl.errors['pattern']) return 'Enter a valid South African mobile number.';
    return 'Check this field.';
  }
}
