import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AppointmentService } from '../../core/services/appointment.service';
import { MasterDataService } from '../../core/services/master-data.service';
import { MasterDataItem } from '../../core/models/master-data.model';
import { DentistService } from '../../core/services/dentist.service';
import { Dentist } from '../../core/models/dentist.model';
import { AuthService } from '../../core/services/auth.service';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule
  ],
  templateUrl: './appointment.component.html',
  styleUrl: './appointment.component.css'
})
export class AppointmentComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly appointmentService = inject(AppointmentService);
  private readonly masterDataService = inject(MasterDataService);
  private readonly dentistService = inject(DentistService);
  private readonly authService = inject(AuthService);
  private readonly uiFeedback = inject(UiFeedbackService);

  loading = false;
  successMessage = '';
  errorMessage = '';

  minDate = this.getTodayDate();
  services: MasterDataItem[] = [];
  timeSlots: MasterDataItem[] = [];
  branches: MasterDataItem[] = [];
  statuses: MasterDataItem[] = [];
  dentists: Dentist[] = [];

  bookingForm = this.fb.group({
    serviceId: ['', Validators.required],
    dentistId: ['', Validators.required],
    branchId: ['', Validators.required],
    date: ['', Validators.required],
    slotId: ['', Validators.required],
    patientName: ['', Validators.required],
    phone: ['', [Validators.required, Validators.pattern(/^(?:\+27|0)[6-8][0-9]{8}$/)]],
    email: ['', [Validators.required, Validators.email]],
    idNumber: ['', [Validators.required, Validators.pattern(/^\d{13}$/)]],
    durationMinutes: [30, Validators.required],
    reason: ['', Validators.required],
    notes: [''],
    status: ['PENDING'],
    internalNotes: ['']
  });

  ngOnInit(): void {
    this.masterDataService.getMany(['services', 'timeSlots', 'branches', 'appointmentStatuses']).subscribe({
      next: (response) => {
        this.services = response['services'] || [];
        this.timeSlots = response['timeSlots'] || [];
        this.branches = response['branches'] || [];
        this.statuses = response['appointmentStatuses'] || [];
      }
    });

    this.dentistService.getDentists().subscribe({
      next: (dentists) => {
        this.dentists = dentists;
      }
    });

    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.bookingForm.patchValue({
        patientName: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || '',
        idNumber: currentUser.idNumber || '',
        status: this.authService.hasRole(['PATIENT']) ? 'CONFIRMED' : 'PENDING'
      });
    }
  }

  submitBooking(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formValue = this.bookingForm.getRawValue();
    const selectedService = this.services.find((item) => item.value === formValue.serviceId);
    const selectedSlot = this.timeSlots.find((item) => item.value === formValue.slotId);
    const selectedDentist = this.dentists.find((item) => item._id === formValue.dentistId);
    const selectedBranch = this.branches.find((item) => item.value === formValue.branchId);

    const payload = {
      patientName: formValue.patientName ?? '',
      email: formValue.email ?? '',
      phone: formValue.phone ?? '',
      idNumber: formValue.idNumber ?? '',
      date: formValue.date ?? '',
      time: selectedSlot?.label || '',
      reason: formValue.reason ?? '',
      notes: formValue.notes ?? '',
      internalNotes: formValue.internalNotes ?? '',
      serviceId: formValue.serviceId ?? '',
      serviceName: selectedService?.label || '',
      dentistId: formValue.dentistId ?? '',
      dentistName: selectedDentist?.name || '',
      branchId: formValue.branchId ?? '',
      branchName: selectedBranch?.label || '',
      slotId: formValue.slotId ?? '',
      durationMinutes: Number(formValue.durationMinutes ?? 30),
      status: this.authService.hasRole(['PATIENT']) ? 'CONFIRMED' as const : (formValue.status as any || 'PENDING')
    };

    const request$ = this.authService.hasRole(['PATIENT'])
      ? this.appointmentService.createMyAppointment(payload as any)
      : this.appointmentService.createPublicAppointment(payload as any);

    request$.subscribe({
      next: () => {
        this.successMessage = this.authService.hasRole(['PATIENT'])
          ? 'Your appointment has been linked to your account and booked successfully.'
          : 'Your appointment has been booked successfully.';
        this.uiFeedback.success(this.successMessage);

        this.bookingForm.patchValue({
          serviceId: '',
          dentistId: '',
          branchId: '',
          date: '',
          slotId: '',
          durationMinutes: 30,
          reason: '',
          notes: '',
          internalNotes: '',
          status: this.authService.hasRole(['PATIENT']) ? 'CONFIRMED' : 'PENDING'
        });
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Failed to book appointment. Please try again.';
        this.uiFeedback.error(this.errorMessage);
        this.loading = false;
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.bookingForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.bookingForm.get(fieldName);
    if (!field?.errors || !(field.dirty || field.touched)) return '';
    if (field.errors['required']) return 'This field is required.';
    if (field.errors['email']) return 'Enter a valid email address.';
    if (field.errors['pattern']) {
      if (fieldName === 'phone') return 'Use a valid South African mobile number.';
      if (fieldName === 'idNumber') return 'Enter a valid 13-digit ID number.';
    }
    return 'Check this field.';
  }

  isSignedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  isStaff(): boolean {
    return this.authService.hasRole(['RECEPTIONIST', 'DENTIST', 'ADMIN']);
  }

  private getTodayDate(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = `${today.getMonth() + 1}`.padStart(2, '0');
    const day = `${today.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}
