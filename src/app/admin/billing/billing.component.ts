import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
  Invoice,
  InvoiceLineItem,
  InvoiceStatus,
  PaymentMethod
} from '../../core/models/invoice.model';
import { InvoiceService, CreateInvoicePayload } from '../../core/services/invoice.service';
import { AppointmentService } from '../../core/services/appointment.service';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';
import { Appointment } from '../../core/models/appointment.model';

interface DraftItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

@Component({
  selector: 'app-billing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './billing.component.html',
  styleUrl: './billing.component.css'
})
export class BillingComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly invoiceService = inject(InvoiceService);
  private readonly appointmentService = inject(AppointmentService);
  private readonly uiFeedback = inject(UiFeedbackService);

  readonly invoices = signal<Invoice[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly actionId = signal<string | null>(null);

  // Filters
  statusFilter = signal<InvoiceStatus | 'ALL'>('ALL');
  searchEmail = '';

  readonly filtered = computed(() => {
    const status = this.statusFilter();
    const email = this.searchEmail.toLowerCase().trim();
    return this.invoices().filter((inv) => {
      const matchStatus = status === 'ALL' || inv.status === status;
      const matchEmail =
        !email || inv.patientEmail.includes(email) || inv.patientName.toLowerCase().includes(email);
      return matchStatus && matchEmail;
    });
  });

  readonly kpiTotal = computed(() => this.invoices().length);
  readonly kpiUnpaid = computed(() => this.invoices().filter((i) => i.status === 'UNPAID').length);
  readonly kpiPaid = computed(() => this.invoices().filter((i) => i.status === 'PAID').length);
  readonly kpiRevenue = computed(() =>
    this.invoices()
      .filter((i) => i.status === 'PAID')
      .reduce((sum, i) => sum + i.total, 0)
  );

  // Create invoice modal
  showCreateModal = false;
  appointments = signal<Appointment[]>([]);
  appointmentsLoading = signal(false);
  selectedAppointmentId = '';
  draftItems: DraftItem[] = [{ description: '', quantity: 1, unitPrice: 0 }];
  draftTaxRate = 0;
  draftDueDate = '';
  draftNotes = '';
  createLoading = false;

  // Pay modal
  showPayModal = false;
  payingInvoice: Invoice | null = null;
  paymentMethod: PaymentMethod = 'CASH';

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.invoiceService
      .listAll()
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (data) => this.invoices.set(data),
        error: (err) => {
          const msg = err?.error?.message || 'Unable to load invoices';
          this.errorMessage.set(msg);
        }
      });
  }

  setStatusFilter(s: InvoiceStatus | 'ALL'): void {
    this.statusFilter.set(s);
  }

  openCreateModal(): void {
    this.selectedAppointmentId = '';
    this.draftItems = [{ description: '', quantity: 1, unitPrice: 0 }];
    this.draftTaxRate = 0;
    this.draftDueDate = '';
    this.draftNotes = '';
    this.showCreateModal = true;
    this.loadAppointments();
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
  }

  private loadAppointments(): void {
    if (this.appointments().length) return;
    this.appointmentsLoading.set(true);
    this.appointmentService
      .listStaffAppointments()
      .pipe(
        finalize(() => this.appointmentsLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (data) => {
          const completed = data
            .filter((a) => a.status === 'COMPLETED')
            .sort((a, b) => b.date.localeCompare(a.date));
          this.appointments.set(completed);
          if (completed.length > 0) {
            this.selectedAppointmentId = completed[0]._id ?? '';
            this.prefillFromAppointment(completed[0]);
          }
        }
      });
  }

  onAppointmentChange(): void {
    const appt = this.appointments().find((a) => a._id === this.selectedAppointmentId);
    if (appt) this.prefillFromAppointment(appt);
  }

  private prefillFromAppointment(appt: Appointment): void {
    this.draftItems = [{ description: appt.serviceName, quantity: 1, unitPrice: 0 }];
  }

  addLine(): void {
    this.draftItems.push({ description: '', quantity: 1, unitPrice: 0 });
  }

  removeLine(i: number): void {
    if (this.draftItems.length > 1) this.draftItems.splice(i, 1);
  }

  lineTotal(item: DraftItem): number {
    return item.quantity * item.unitPrice;
  }

  get draftSubtotal(): number {
    return this.draftItems.reduce((s, i) => s + this.lineTotal(i), 0);
  }

  get draftTaxAmount(): number {
    return Math.round(this.draftSubtotal * (this.draftTaxRate / 100) * 100) / 100;
  }

  get draftTotal(): number {
    return this.draftSubtotal + this.draftTaxAmount;
  }

  submitCreate(): void {
    if (!this.selectedAppointmentId) {
      this.uiFeedback.error('Please select an appointment');
      return;
    }
    const items = this.draftItems.filter((i) => i.description.trim() && i.unitPrice > 0);
    if (!items.length) {
      this.uiFeedback.error('At least one line item with a price is required');
      return;
    }

    const payload: CreateInvoicePayload = {
      appointmentId: this.selectedAppointmentId,
      items,
      taxRate: this.draftTaxRate,
      dueDate: this.draftDueDate || null,
      notes: this.draftNotes
    };

    this.createLoading = true;
    this.invoiceService
      .create(payload)
      .pipe(
        finalize(() => (this.createLoading = false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (inv) => {
          this.invoices.update((list) => [inv, ...list]);
          this.uiFeedback.success(`Invoice ${inv.invoiceNumber} created`);
          this.showCreateModal = false;
        },
        error: (err) => {
          this.uiFeedback.error(err?.error?.message || 'Failed to create invoice');
        }
      });
  }

  openPayModal(inv: Invoice): void {
    this.payingInvoice = inv;
    this.paymentMethod = 'CASH';
    this.showPayModal = true;
  }

  closePayModal(): void {
    this.showPayModal = false;
    this.payingInvoice = null;
  }

  confirmPay(): void {
    if (!this.payingInvoice?._id) return;
    this.actionId.set(this.payingInvoice._id);
    this.invoiceService
      .markPaid(this.payingInvoice._id, this.paymentMethod)
      .pipe(
        finalize(() => this.actionId.set(null)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (updated) => {
          this.invoices.update((list) => list.map((i) => (i._id === updated._id ? updated : i)));
          this.uiFeedback.success(`Invoice ${updated.invoiceNumber} marked as paid`);
          this.showPayModal = false;
          this.payingInvoice = null;
        },
        error: (err) => {
          this.uiFeedback.error(err?.error?.message || 'Failed to mark as paid');
        }
      });
  }

  cancelInvoice(inv: Invoice): void {
    if (!inv._id || this.actionId()) return;
    this.actionId.set(inv._id);
    this.invoiceService
      .update(inv._id, { status: 'CANCELLED' })
      .pipe(
        finalize(() => this.actionId.set(null)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (updated) => {
          this.invoices.update((list) => list.map((i) => (i._id === updated._id ? updated : i)));
          this.uiFeedback.success('Invoice cancelled');
        },
        error: (err) => {
          this.uiFeedback.error(err?.error?.message || 'Failed to cancel invoice');
        }
      });
  }

  statusClass(status: InvoiceStatus): string {
    return status.toLowerCase();
  }

  formatCurrency(amount: number): string {
    return `R ${amount.toFixed(2)}`;
  }

  trackByIndex(index: number): number {
    return index;
  }
}
