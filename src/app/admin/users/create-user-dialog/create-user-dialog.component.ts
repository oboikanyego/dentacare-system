import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { CreateUserRequest } from '../../../core/models/user.model';
import { MasterDataItem } from '../../../core/models/master-data.model';

export interface CreateUserDialogData {
  roles: MasterDataItem[];
}

@Component({
  selector: 'app-create-user-dialog',
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
  templateUrl: './create-user-dialog.component.html',
  styleUrl: './create-user-dialog.component.css'
})
export class CreateUserDialogComponent {
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.pattern(/^(?:\+27|0)[6-8][0-9]{8}$/)]],
    idNumber: ['', [Validators.required, Validators.pattern(/^\d{13}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['RECEPTIONIST', Validators.required],
    isActive: [true]
  });

  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: CreateUserDialogData,
    public readonly dialogRef: MatDialogRef<CreateUserDialogComponent, CreateUserRequest | undefined>
  ) {}

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.dialogRef.close(this.form.getRawValue() as CreateUserRequest);
  }
}
