import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { Appointment } from '../../core/models/appointment.model';
import { AppointmentService } from '../../core/services/appointment.service';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';

export interface PatientSummary {
  key: string;
  patientName: string;
  email: string;
  phone: string;
  idNumber: string;
  total: number;
  completed: number;
  cancelled: number;
  pending: number;
  lastVisit: string | null;
  nextVisit: string | null;
  nextService: string | null;
  appointments: Appointment[];
}

@Component({
  selector: 'app-patients-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './patients.component.html',
  styleUrl: './patients.component.css'
})
export class PatientsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly appointmentService = inject(AppointmentService);
  private readonly uiFeedback = inject(UiFeedbackService);

  private readonly allAppointments = signal<Appointment[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  searchTerm = '';
  selectedPatient = signal<PatientSummary | null>(null);
  apptSortKey: 'date' | 'status' = 'date';

  readonly patients = computed((): PatientSummary[] => {
    const today = new Date().toISOString().slice(0, 10);
    const map = new Map<string, PatientSummary>();

    for (const a of this.allAppointments()) {
      const key = a.email?.toLowerCase() || a.idNumber || a.patientName?.toLowerCase() || 'unknown';
      if (!map.has(key)) {
        map.set(key, {
          key,
          patientName: a.patientName ?? '',
          email: a.email ?? '',
          phone: a.phone ?? '',
          idNumber: a.idNumber ?? '',
          total: 0,
          completed: 0,
          cancelled: 0,
          pending: 0,
          lastVisit: null,
          nextVisit: null,
          nextService: null,
          appointments: []
        });
      }
      const p = map.get(key)!;
      p.appointments.push(a);
      p.total++;
      if (a.status === 'COMPLETED') p.completed++;
      if (a.status === 'CANCELLED') p.cancelled++;
      if (['PENDING', 'CONFIRMED'].includes(a.status)) p.pending++;

      if (a.date < today && a.status === 'COMPLETED') {
        if (!p.lastVisit || a.date > p.lastVisit) p.lastVisit = a.date;
      }
      if (a.date >= today && !['CANCELLED', 'NO_SHOW'].includes(a.status)) {
        if (!p.nextVisit || a.date < p.nextVisit) {
          p.nextVisit = a.date;
          p.nextService = a.serviceName;
        }
      }
      if (a.patientName && a.patientName.length > p.patientName.length) {
        p.patientName = a.patientName;
      }
    }

    return [...map.values()].sort((a, b) => a.patientName.localeCompare(b.patientName));
  });

  readonly filtered = computed((): PatientSummary[] => {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.patients();
    return this.patients().filter((p) => {
      const haystack = [p.patientName, p.email, p.phone, p.idNumber].join(' ').toLowerCase();
      return haystack.includes(term);
    });
  });

  readonly sortedPatientAppointments = computed((): Appointment[] => {
    const p = this.selectedPatient();
    if (!p) return [];
    return [...p.appointments].sort((a, b) => {
      if (this.apptSortKey === 'status') return a.status.localeCompare(b.status);
      return b.date.localeCompare(a.date);
    });
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.appointmentService
      .listStaffAppointments()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (data) => this.allAppointments.set(data),
        error: (err) => {
          const msg = err?.error?.message || 'Unable to load patients';
          this.errorMessage.set(msg);
          this.uiFeedback.error(msg);
        }
      });
  }

  openPatient(p: PatientSummary): void {
    this.selectedPatient.set(p);
    this.apptSortKey = 'date';
  }

  closePatient(): void {
    this.selectedPatient.set(null);
  }

  statusClass(status: Appointment['status']): string {
    return status.toLowerCase().replace('_', '-');
  }

  maskName(value?: string | null): string {
    if (!value?.trim()) return 'Patient';
    return value
      .trim()
      .split(/\s+/)
      .map((part) => `${part.charAt(0)}•••`)
      .join(' ');
  }

  maskEmail(value?: string | null): string {
    if (!value) return '—';
    const [local] = value.split('@');
    return `${local?.charAt(0) || '•'}•••@•••`;
  }

  maskPhone(value?: string | null): string {
    if (!value) return '—';
    const clean = value.replace(/\s+/g, '');
    return clean.length > 4 ? `${clean.slice(0, 3)}•••••${clean.slice(-2)}` : '••••';
  }
}
