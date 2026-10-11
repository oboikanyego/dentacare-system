import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Invoice } from '../../core/models/invoice.model';
import { InvoiceService } from '../../core/services/invoice.service';

@Component({
  selector: 'app-patient-invoices',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-invoices.component.html',
  styleUrl: './patient-invoices.component.css'
})
export class PatientInvoicesComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly invoiceService = inject(InvoiceService);

  readonly invoices = signal<Invoice[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly expandedId = signal<string | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.invoiceService
      .listMine()
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

  toggleExpand(id: string | undefined): void {
    if (!id) return;
    this.expandedId.update((current) => (current === id ? null : id));
  }

  statusClass(status: Invoice['status']): string {
    return status.toLowerCase();
  }

  formatCurrency(amount: number): string {
    return `R ${amount.toFixed(2)}`;
  }
}
