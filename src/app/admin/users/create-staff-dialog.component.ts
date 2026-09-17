import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MasterDataItem } from '../../core/models/master-data.model';

@Component({
  selector: 'app-create-staff-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule
  ],
  templateUrl: './create-staff-dialog.component.html',
  styleUrl: './create-staff-dialog.component.css'
})
export class CreateStaffDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<CreateStaffDialogComponent>);
  readonly data = inject<{ roles: MasterDataItem[] }>(MAT_DIALOG_DATA);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.pattern(/^(?:\+27|0)[6-8][0-9]{8}$/)]],
    idNumber: ['', [Validators.required, Validators.pattern(/^\d{13}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['RECEPTIONIST'],
    isActive: [true]
  });

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.dialogRef.close(this.form.getRawValue());
  }
}
