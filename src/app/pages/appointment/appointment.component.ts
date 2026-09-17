import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, WritableSignal, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  map,
  of,
  startWith,
  switchMap,
  tap
} from 'rxjs';
import { Dentist } from '../../core/models/dentist.model';
import { MasterDataItem } from '../../core/models/master-data.model';
import { AppointmentService } from '../../core/services/appointment.service';
import { AuthService } from '../../core/services/auth.service';
import { DentistService } from '../../core/services/dentist.service';
import { MasterDataListResponse, MasterDataService } from '../../core/services/master-data.service';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';
import { formatLocalDate, notPastDateValidator, startOfLocalDay } from '../../core/validators/date.validators';

type SearchableMasterDataField = 'branchId' | 'serviceId' | 'slotId';

@Component({
  selector: 'app-appointment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTooltipModule
  ],
  templateUrl: './appointment.component.html',
  styleUrl: './appointment.component.css'
})
export class AppointmentComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly appointmentService = inject(AppointmentService);
  private readonly masterDataService = inject(MasterDataService);
  private readonly dentistService = inject(DentistService);
  private readonly authService = inject(AuthService);
  private readonly uiFeedback = inject(UiFeedbackService);

  readonly loading = signal(false);
  readonly successMessage = signal('');
  readonly errorMessage = signal('');

  readonly branchLoading = signal(false);
  readonly serviceLoading = signal(false);
  readonly dentistLoading = signal(false);
  readonly timeLoading = signal(false);

  readonly branchOptions = signal<MasterDataItem[]>([]);
  readonly serviceOptions = signal<MasterDataItem[]>([]);
  readonly timeOptions = signal<MasterDataItem[]>([]);
  readonly dentistOptions = signal<Dentist[]>([]);
  readonly statuses = signal<MasterDataItem[]>([]);

  readonly selectedBranch = signal<MasterDataItem | null>(null);
  readonly selectedService = signal<MasterDataItem | null>(null);
  readonly selectedTime = signal<MasterDataItem | null>(null);
  readonly selectedDentist = signal<Dentist | null>(null);

  readonly branchSearch = new FormControl('', { nonNullable: true });
  readonly serviceSearch = new FormControl('', { nonNullable: true });
  readonly dentistSearch = new FormControl('', { nonNullable: true });
  readonly timeSearch = new FormControl('', { nonNullable: true });

  readonly minDate = startOfLocalDay(new Date());

  readonly bookingForm = this.fb.group({
    serviceId: ['', Validators.required],
    dentistId: ['', Validators.required],
    branchId: ['', Validators.required],
    date: [null as Date | null, [Validators.required, notPastDateValidator()]],
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
    this.bindMasterDataSearch(
      this.branchSearch,
      'branches',
      this.branchOptions,
      this.branchLoading,
      this.selectedBranch,
      'branchId'
    );
    this.bindMasterDataSearch(
      this.serviceSearch,
      'services',
      this.serviceOptions,
      this.serviceLoading,
      this.selectedService,
      'serviceId'
    );
    this.bindMasterDataSearch(
      this.timeSearch,
      'timeSlots',
      this.timeOptions,
      this.timeLoading,
      this.selectedTime,
      'slotId'
    );
    this.bindDentistSearch();

    this.masterDataService
      .getOne('appointmentStatuses')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => this.statuses.set(response.items || []),
        error: () => this.statuses.set([])
      });

    const currentUser = this.authService.getCurrentUser();
    if (currentUser && this.authService.hasRole(['PATIENT'])) {
      this.bookingForm.patchValue({
        patientName: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone || '',
        idNumber: currentUser.idNumber || '',
        status: 'CONFIRMED'
      });
    }
  }

  selectBranch(branch: MasterDataItem, isUserInput: boolean): void {
    if (!isUserInput) return;
    this.selectedBranch.set(branch);
    this.bookingForm.controls.branchId.setValue(branch.value);
    this.branchSearch.setValue(branch.label, { emitEvent: false });
  }

  selectService(service: MasterDataItem, isUserInput: boolean): void {
    if (!isUserInput) return;
    this.selectedService.set(service);
    this.bookingForm.controls.serviceId.setValue(service.value);
    this.serviceSearch.setValue(service.label, { emitEvent: false });
  }

  selectTime(slot: MasterDataItem, isUserInput: boolean): void {
    if (!isUserInput) return;
    this.selectedTime.set(slot);
    this.bookingForm.controls.slotId.setValue(slot.value);
    this.timeSearch.setValue(slot.label, { emitEvent: false });
  }

  selectDentist(dentist: Dentist, isUserInput: boolean): void {
    if (!isUserInput) return;
    this.selectedDentist.set(dentist);
    this.bookingForm.controls.dentistId.setValue(dentist._id);
    this.dentistSearch.setValue(this.getDentistLabel(dentist), { emitEvent: false });
  }

  getDentistLabel(dentist: Dentist): string {
    return dentist.specialization ? `${dentist.name} · ${dentist.specialization}` : dentist.name;
  }

  submitBooking(): void {
    this.successMessage.set('');
    this.errorMessage.set('');

    if (this.bookingForm.invalid) {
      this.bookingForm.markAllAsTouched();
      return;
    }

    const formValue = this.bookingForm.getRawValue();
    const selectedService = this.selectedService();
    const selectedSlot = this.selectedTime();
    const selectedDentist = this.selectedDentist();
    const selectedBranch = this.selectedBranch();
    const isPatient = this.authService.hasRole(['PATIENT']);
    const isStaff = this.isStaff();

    const payload = {
      patientName: formValue.patientName ?? '',
      email: formValue.email ?? '',
      phone: formValue.phone ?? '',
      idNumber: formValue.idNumber ?? '',
      date: formatLocalDate(formValue.date),
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
      status: isPatient
        ? ('CONFIRMED' as const)
        : isStaff
          ? (formValue.status as never) || 'PENDING'
          : ('PENDING' as const)
    };

    const request$ = isPatient
      ? this.appointmentService.createMyAppointment(payload as never)
      : isStaff
        ? this.appointmentService.createStaffAppointment(payload as never)
        : this.appointmentService.createPublicAppointment(payload as never);

    this.loading.set(true);
    request$
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          const message = isPatient
            ? 'Your appointment has been linked to your account and booked successfully.'
            : 'Your appointment has been booked successfully.';
          this.successMessage.set(message);
          this.uiFeedback.success(message);
          this.resetBookingSelection(isPatient);
        },
        error: (error) => {
          const message = error?.error?.message || 'Failed to book appointment. Please try again.';
          this.errorMessage.set(message);
          this.uiFeedback.error(message);
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
    if (field.errors['pastDate'] || field.errors['matDatepickerMin']) {
      return 'Choose today or a future date.';
    }
    if (field.errors['matDatepickerParse']) return 'Choose a valid date from the calendar.';
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

  private bindMasterDataSearch(
    control: FormControl<string>,
    key: string,
    options: WritableSignal<MasterDataItem[]>,
    loading: WritableSignal<boolean>,
    selected: WritableSignal<MasterDataItem | null>,
    formField: SearchableMasterDataField
  ): void {
    control.valueChanges
      .pipe(
        startWith(control.value),
        map((value) => value.trim()),
        debounceTime(250),
        distinctUntilChanged(),
        tap((value) => {
          if (selected()?.label !== value) {
            selected.set(null);
            this.bookingForm.controls[formField].setValue('');
          }
          loading.set(true);
        }),
        switchMap((search) =>
          this.masterDataService.search(key, search, 12).pipe(
            catchError(() => of<MasterDataListResponse>({ key, description: '', items: [] })),
            finalize(() => loading.set(false))
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response) => options.set(response.items || []));
  }

  private bindDentistSearch(): void {
    this.dentistSearch.valueChanges
      .pipe(
        startWith(this.dentistSearch.value),
        map((value) => value.trim()),
        debounceTime(250),
        distinctUntilChanged(),
        tap((value) => {
          if (this.getSelectedDentistLabel() !== value) {
            this.selectedDentist.set(null);
            this.bookingForm.controls.dentistId.setValue('');
          }
          this.dentistLoading.set(true);
        }),
        switchMap((search) =>
          this.dentistService.getDentists(search, 12).pipe(
            catchError(() => of<Dentist[]>([])),
            finalize(() => this.dentistLoading.set(false))
          )
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((dentists) => this.dentistOptions.set(dentists));
  }

  private getSelectedDentistLabel(): string {
    const dentist = this.selectedDentist();
    return dentist ? this.getDentistLabel(dentist) : '';
  }

  private resetBookingSelection(isPatient: boolean): void {
    this.bookingForm.patchValue({
      serviceId: '',
      dentistId: '',
      branchId: '',
      date: null,
      slotId: '',
      durationMinutes: 30,
      reason: '',
      notes: '',
      internalNotes: '',
      status: isPatient ? 'CONFIRMED' : 'PENDING'
    });

    this.selectedBranch.set(null);
    this.selectedService.set(null);
    this.selectedDentist.set(null);
    this.selectedTime.set(null);
    this.branchSearch.setValue('');
    this.serviceSearch.setValue('');
    this.dentistSearch.setValue('');
    this.timeSearch.setValue('');
  }
}
