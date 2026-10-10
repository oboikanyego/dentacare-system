import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, WritableSignal, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
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
import { Dentist, DentistSchedule } from '../../../core/models/dentist.model';
import { MasterDataItem } from '../../../core/models/master-data.model';
import { DentistService } from '../../../core/services/dentist.service';
import {
  MasterDataListResponse,
  MasterDataService
} from '../../../core/services/master-data.service';
import {
  formatLocalDate,
  notPastDateValidator,
  startOfLocalDay
} from '../../../core/validators/date.validators';

@Component({
  selector: 'app-staff-booking-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatAutocompleteModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    MatSelectModule
  ],
  templateUrl: './staff-booking-dialog.component.html',
  styleUrl: './staff-booking-dialog.component.css'
})
export class StaffBookingDialogComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly masterDataService = inject(MasterDataService);
  private readonly dentistService = inject(DentistService);
  private readonly destroyRef = inject(DestroyRef);
  readonly dialogRef = inject(MatDialogRef<StaffBookingDialogComponent>);

  readonly loading = signal(false);
  readonly dentistSchedule = signal<DentistSchedule | null>(null);
  readonly branchOptions = signal<MasterDataItem[]>([]);
  readonly serviceOptions = signal<MasterDataItem[]>([]);
  readonly timeOptions = signal<MasterDataItem[]>([]);
  readonly dentistOptions = signal<Dentist[]>([]);
  readonly statusOptions = signal<MasterDataItem[]>([]);

  readonly selectedBranch = signal<MasterDataItem | null>(null);
  readonly selectedService = signal<MasterDataItem | null>(null);
  readonly selectedTime = signal<MasterDataItem | null>(null);
  readonly selectedDentist = signal<Dentist | null>(null);

  readonly branchSearch = new FormControl('', { nonNullable: true });
  readonly serviceSearch = new FormControl('', { nonNullable: true });
  readonly dentistSearch = new FormControl('', { nonNullable: true });
  readonly timeSearch = new FormControl('', { nonNullable: true });

  readonly minDate = startOfLocalDay(new Date());

  readonly form = this.fb.group({
    patientName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^(?:\+27|0)[6-8][0-9]{8}$/)]],
    idNumber: ['', [Validators.required, Validators.pattern(/^\d{13}$/)]],
    serviceId: ['', Validators.required],
    dentistId: ['', Validators.required],
    branchId: ['', Validators.required],
    date: [null as Date | null, [Validators.required, notPastDateValidator()]],
    slotId: ['', Validators.required],
    durationMinutes: [30, Validators.required],
    reason: ['', Validators.required],
    notes: [''],
    internalNotes: [''],
    status: ['PENDING', Validators.required]
  });

  ngOnInit(): void {
    this.bindMasterDataSearch(
      this.branchSearch,
      'branches',
      this.branchOptions,
      this.selectedBranch,
      'branchId'
    );
    this.bindMasterDataSearch(
      this.serviceSearch,
      'services',
      this.serviceOptions,
      this.selectedService,
      'serviceId'
    );
    this.bindMasterDataSearch(
      this.timeSearch,
      'timeSlots',
      this.timeOptions,
      this.selectedTime,
      'slotId'
    );
    this.bindDentistSearch();

    this.masterDataService
      .getOne('appointmentStatuses')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (r) => this.statusOptions.set(r.items || []), error: () => {} });
  }

  selectBranch(item: MasterDataItem): void {
    this.selectedBranch.set(item);
    this.form.controls.branchId.setValue(item.value);
    this.branchSearch.setValue(item.label, { emitEvent: false });
  }

  selectService(item: MasterDataItem): void {
    this.selectedService.set(item);
    this.form.controls.serviceId.setValue(item.value);
    this.serviceSearch.setValue(item.label, { emitEvent: false });
  }

  selectTime(item: MasterDataItem): void {
    this.selectedTime.set(item);
    this.form.controls.slotId.setValue(item.value);
    this.timeSearch.setValue(item.label, { emitEvent: false });
  }

  selectDentist(dentist: Dentist): void {
    this.selectedDentist.set(dentist);
    this.form.controls.dentistId.setValue(dentist._id);
    this.dentistSearch.setValue(dentist.name, { emitEvent: false });
    this.dentistSchedule.set(null);
    this.form.controls.date.setValue(null);
    this.dentistService
      .getDentistAvailability(dentist._id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (r) => this.dentistSchedule.set(r.schedule), error: () => {} });
  }

  isDateAvailable = (date: Date | null): boolean => {
    const schedule = this.dentistSchedule();
    if (!date) return true;
    if (!schedule?.workingDays?.length) return true;
    return schedule.workingDays.includes(date.getDay());
  };

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const payload = {
      patientName: v.patientName!,
      email: v.email!,
      phone: v.phone!,
      idNumber: v.idNumber!,
      serviceId: v.serviceId!,
      serviceName: this.selectedService()?.label ?? '',
      dentistId: v.dentistId!,
      dentistName: this.selectedDentist()?.name ?? '',
      branchId: v.branchId!,
      branchName: this.selectedBranch()?.label ?? '',
      date: formatLocalDate(v.date),
      slotId: v.slotId!,
      time: this.selectedTime()?.label ?? '',
      durationMinutes: Number(v.durationMinutes ?? 30),
      reason: v.reason!,
      notes: v.notes ?? '',
      internalNotes: v.internalNotes ?? '',
      status: v.status ?? 'PENDING'
    };

    this.dialogRef.close(payload);
  }

  cancel(): void {
    this.dialogRef.close(null);
  }

  isFieldInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!ctrl && ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }

  getFieldError(field: string): string {
    const ctrl = this.form.get(field);
    if (!ctrl?.errors || !(ctrl.dirty || ctrl.touched)) return '';
    if (ctrl.errors['required']) return 'Required.';
    if (ctrl.errors['email']) return 'Enter a valid email.';
    if (ctrl.errors['pattern']) {
      if (field === 'phone') return 'Valid SA mobile number required.';
      if (field === 'idNumber') return '13-digit ID number required.';
    }
    if (ctrl.errors['pastDate']) return 'Choose today or a future date.';
    return 'Check this field.';
  }

  private bindMasterDataSearch(
    control: FormControl<string>,
    key: string,
    options: WritableSignal<MasterDataItem[]>,
    selected: WritableSignal<MasterDataItem | null>,
    formField: 'branchId' | 'serviceId' | 'slotId'
  ): void {
    control.valueChanges
      .pipe(
        startWith(control.value),
        map((v) => v.trim()),
        debounceTime(200),
        distinctUntilChanged(),
        tap((v) => {
          if (selected()?.label !== v) {
            selected.set(null);
            this.form.controls[formField].setValue('');
          }
        }),
        switchMap((search) =>
          this.masterDataService
            .search(key, search, 12)
            .pipe(catchError(() => of<MasterDataListResponse>({ key, description: '', items: [] })))
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((r) => options.set(r.items || []));
  }

  private bindDentistSearch(): void {
    this.dentistSearch.valueChanges
      .pipe(
        startWith(this.dentistSearch.value),
        map((v) => v.trim()),
        debounceTime(200),
        distinctUntilChanged(),
        tap((v) => {
          if (this.selectedDentist()?.name !== v) {
            this.selectedDentist.set(null);
            this.form.controls.dentistId.setValue('');
          }
        }),
        switchMap((search) =>
          this.dentistService.getDentists(search, 12).pipe(catchError(() => of<Dentist[]>([])))
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((dentists) => this.dentistOptions.set(dentists));
  }
}
