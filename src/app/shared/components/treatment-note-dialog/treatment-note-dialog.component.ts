import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Inject, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { finalize } from 'rxjs';
import { Appointment } from '../../../core/models/appointment.model';
import { TreatmentNoteService } from '../../../core/services/treatment-note.service';
import { UiFeedbackService } from '../../../core/services/ui-feedback.service';

export interface TreatmentNoteDialogData {
  appointment: Appointment;
}

@Component({
  selector: 'app-treatment-note-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './treatment-note-dialog.component.html',
  styleUrl: './treatment-note-dialog.component.css'
})
export class TreatmentNoteDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly treatmentNoteService = inject(TreatmentNoteService);
  private readonly uiFeedback = inject(UiFeedbackService);
  private readonly destroyRef = inject(DestroyRef);

  readonly dialogRef = inject(MatDialogRef<TreatmentNoteDialogComponent>);
  readonly loading = signal(false);

  readonly form = this.fb.group({
    diagnosis: ['', Validators.required],
    treatment: ['', Validators.required],
    prescription: [''],
    followUpDate: [''],
    notes: ['']
  });

  constructor(@Inject(MAT_DIALOG_DATA) public readonly data: TreatmentNoteDialogData) {}

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.loading.set(true);
    this.treatmentNoteService
      .create({
        appointmentId: this.data.appointment._id!,
        diagnosis: v.diagnosis!,
        treatment: v.treatment!,
        prescription: v.prescription ?? '',
        followUpDate: v.followUpDate || null,
        notes: v.notes ?? ''
      })
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (note) => {
          this.uiFeedback.success('Treatment note saved');
          this.dialogRef.close(note);
        },
        error: (err) => {
          this.uiFeedback.error(err?.error?.message || 'Failed to save note');
        }
      });
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }
}
