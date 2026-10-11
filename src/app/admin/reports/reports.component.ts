import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { finalize, forkJoin } from 'rxjs';
import { Appointment } from '../../core/models/appointment.model';
import { Invoice } from '../../core/models/invoice.model';
import { AppointmentService } from '../../core/services/appointment.service';
import { InvoiceService } from '../../core/services/invoice.service';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';

type Preset = 'today' | 'week' | 'month' | 'last-month' | 'quarter' | 'year' | 'custom';

interface ServiceRow {
  name: string;
  total: number;
  completed: number;
  cancelled: number;
  noShow: number;
  completionRate: number;
}

interface DentistRow {
  name: string;
  total: number;
  completed: number;
  cancelled: number;
  noShow: number;
  completionRate: number;
  noShowRate: number;
}

interface RevenueServiceRow {
  name: string;
  invoiced: number;
  collected: number;
  outstanding: number;
}

interface RevenueDentistRow {
  name: string;
  invoiced: number;
  collected: number;
  outstanding: number;
}

interface DayBar {
  label: string;
  count: number;
  pct: number;
}

interface MonthBar {
  label: string;
  count: number;
  pct: number;
}

@Component({
  selector: 'app-reports-page',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly appointmentService = inject(AppointmentService);
  private readonly invoiceService = inject(InvoiceService);
  private readonly uiFeedback = inject(UiFeedbackService);

  private readonly allAppointments = signal<Appointment[]>([]);
  private readonly allInvoices = signal<Invoice[]>([]);
  readonly isLoading = signal(false);
  readonly errorMessage = signal('');

  preset: Preset = 'month';
  dateFrom = '';
  dateTo = '';

  readonly presets: { value: Preset; label: string }[] = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This week' },
    { value: 'month', label: 'This month' },
    { value: 'last-month', label: 'Last month' },
    { value: 'quarter', label: 'This quarter' },
    { value: 'year', label: 'This year' }
  ];

  private get today(): string {
    return new Date().toISOString().slice(0, 10);
  }

  readonly filtered = computed(() => {
    const from = this.dateFrom;
    const to = this.dateTo;
    return this.allAppointments().filter((a) => (!from || a.date >= from) && (!to || a.date <= to));
  });

  readonly total = computed(() => this.filtered().length);
  readonly completed = computed(
    () => this.filtered().filter((a) => a.status === 'COMPLETED').length
  );
  readonly confirmed = computed(
    () => this.filtered().filter((a) => a.status === 'CONFIRMED').length
  );
  readonly pending = computed(() => this.filtered().filter((a) => a.status === 'PENDING').length);
  readonly cancelled = computed(
    () => this.filtered().filter((a) => a.status === 'CANCELLED').length
  );
  readonly noShow = computed(() => this.filtered().filter((a) => a.status === 'NO_SHOW').length);

  readonly completionRate = computed(() =>
    this.total() > 0 ? Math.round((this.completed() / this.total()) * 100) : 0
  );
  readonly noShowRate = computed(() =>
    this.total() > 0 ? Math.round((this.noShow() / this.total()) * 100) : 0
  );
  readonly cancellationRate = computed(() =>
    this.total() > 0 ? Math.round((this.cancelled() / this.total()) * 100) : 0
  );

  readonly byDayOfWeek = computed((): DayBar[] => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const counts = [0, 0, 0, 0, 0, 0, 0];
    for (const a of this.filtered()) {
      const d = new Date(a.date + 'T00:00:00');
      const idx = (d.getDay() + 6) % 7;
      counts[idx]++;
    }
    const max = Math.max(...counts, 1);
    return days.map((label, i) => ({
      label,
      count: counts[i],
      pct: Math.round((counts[i] / max) * 100)
    }));
  });

  readonly byMonth = computed((): MonthBar[] => {
    const map = new Map<string, number>();
    for (const a of this.filtered()) {
      const month = a.date.slice(0, 7);
      map.set(month, (map.get(month) ?? 0) + 1);
    }
    const sorted = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0])).slice(-12);
    const max = Math.max(...sorted.map(([, v]) => v), 1);
    return sorted.map(([key, count]) => ({
      label: new Date(key + '-01').toLocaleDateString('en-ZA', { month: 'short', year: '2-digit' }),
      count,
      pct: Math.round((count / max) * 100)
    }));
  });

  readonly byService = computed((): ServiceRow[] => {
    const map = new Map<string, ServiceRow>();
    for (const a of this.filtered()) {
      const name = a.serviceName ?? 'Unknown';
      if (!map.has(name))
        map.set(name, { name, total: 0, completed: 0, cancelled: 0, noShow: 0, completionRate: 0 });
      const r = map.get(name)!;
      r.total++;
      if (a.status === 'COMPLETED') r.completed++;
      if (a.status === 'CANCELLED') r.cancelled++;
      if (a.status === 'NO_SHOW') r.noShow++;
    }
    return [...map.values()]
      .sort((a, b) => b.total - a.total)
      .map((r) => ({
        ...r,
        completionRate: r.total > 0 ? Math.round((r.completed / r.total) * 100) : 0
      }));
  });

  readonly filteredInvoices = computed(() => {
    const from = this.dateFrom;
    const to = this.dateTo;
    return this.allInvoices().filter(
      (inv) => (!from || inv.date >= from) && (!to || inv.date <= to)
    );
  });

  readonly revenueTotal = computed(() =>
    this.filteredInvoices().reduce((sum, inv) => sum + inv.total, 0)
  );

  readonly revenueCollected = computed(() =>
    this.filteredInvoices()
      .filter((inv) => inv.status === 'PAID')
      .reduce((sum, inv) => sum + inv.total, 0)
  );

  readonly revenueOutstanding = computed(() =>
    this.filteredInvoices()
      .filter((inv) => inv.status === 'UNPAID')
      .reduce((sum, inv) => sum + inv.total, 0)
  );

  readonly invoiceCount = computed(() => this.filteredInvoices().length);

  readonly revenueByService = computed((): RevenueServiceRow[] => {
    const map = new Map<string, RevenueServiceRow>();
    for (const inv of this.filteredInvoices()) {
      if (inv.status === 'CANCELLED') continue;
      const name = inv.serviceName || 'Unknown';
      if (!map.has(name)) map.set(name, { name, invoiced: 0, collected: 0, outstanding: 0 });
      const r = map.get(name)!;
      r.invoiced += inv.total;
      if (inv.status === 'PAID') r.collected += inv.total;
      if (inv.status === 'UNPAID') r.outstanding += inv.total;
    }
    return [...map.values()].sort((a, b) => b.invoiced - a.invoiced);
  });

  readonly revenueByDentist = computed((): RevenueDentistRow[] => {
    const map = new Map<string, RevenueDentistRow>();
    for (const inv of this.filteredInvoices()) {
      if (inv.status === 'CANCELLED') continue;
      const name = inv.dentistName || 'Unknown';
      if (!map.has(name)) map.set(name, { name, invoiced: 0, collected: 0, outstanding: 0 });
      const r = map.get(name)!;
      r.invoiced += inv.total;
      if (inv.status === 'PAID') r.collected += inv.total;
      if (inv.status === 'UNPAID') r.outstanding += inv.total;
    }
    return [...map.values()].sort((a, b) => b.invoiced - a.invoiced);
  });

  readonly byDentist = computed((): DentistRow[] => {
    const map = new Map<string, DentistRow>();
    for (const a of this.filtered()) {
      const name = a.dentistName ?? 'Unknown';
      if (!map.has(name))
        map.set(name, {
          name,
          total: 0,
          completed: 0,
          cancelled: 0,
          noShow: 0,
          completionRate: 0,
          noShowRate: 0
        });
      const r = map.get(name)!;
      r.total++;
      if (a.status === 'COMPLETED') r.completed++;
      if (a.status === 'CANCELLED') r.cancelled++;
      if (a.status === 'NO_SHOW') r.noShow++;
    }
    return [...map.values()]
      .sort((a, b) => b.total - a.total)
      .map((r) => ({
        ...r,
        completionRate: r.total > 0 ? Math.round((r.completed / r.total) * 100) : 0,
        noShowRate: r.total > 0 ? Math.round((r.noShow / r.total) * 100) : 0
      }));
  });

  ngOnInit(): void {
    this.applyPreset('month');
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    forkJoin({
      appointments: this.appointmentService.listStaffAppointments(),
      invoices: this.invoiceService.listAll()
    })
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: ({ appointments, invoices }) => {
          this.allAppointments.set(appointments);
          this.allInvoices.set(invoices);
        },
        error: (err) => {
          const msg = err?.error?.message || 'Unable to load reports';
          this.errorMessage.set(msg);
          this.uiFeedback.error(msg);
        }
      });
  }

  formatCurrency(amount: number): string {
    return `R ${amount.toFixed(2)}`;
  }

  applyPreset(p: Preset): void {
    this.preset = p;
    const now = new Date();
    const pad = (n: number) => String(n).padStart(2, '0');
    const fmt = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

    if (p === 'today') {
      this.dateFrom = this.dateTo = this.today;
    } else if (p === 'week') {
      const mon = new Date(now);
      const day = now.getDay();
      mon.setDate(now.getDate() - (day === 0 ? 6 : day - 1));
      this.dateFrom = fmt(mon);
      this.dateTo = this.today;
    } else if (p === 'month') {
      this.dateFrom = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`;
      this.dateTo = this.today;
    } else if (p === 'last-month') {
      const first = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const last = new Date(now.getFullYear(), now.getMonth(), 0);
      this.dateFrom = fmt(first);
      this.dateTo = fmt(last);
    } else if (p === 'quarter') {
      const qStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      this.dateFrom = fmt(qStart);
      this.dateTo = this.today;
    } else if (p === 'year') {
      this.dateFrom = `${now.getFullYear()}-01-01`;
      this.dateTo = this.today;
    }
  }

  onCustomDate(): void {
    this.preset = 'custom';
  }

  exportSummary(): void {
    const rows = [
      ['Metric', 'Value'],
      ['Period', `${this.dateFrom} to ${this.dateTo}`],
      ['Total bookings', String(this.total())],
      ['Completed', String(this.completed())],
      ['Confirmed', String(this.confirmed())],
      ['Pending', String(this.pending())],
      ['Cancelled', String(this.cancelled())],
      ['No-show', String(this.noShow())],
      ['Completion rate', `${this.completionRate()}%`],
      ['No-show rate', `${this.noShowRate()}%`],
      ['Cancellation rate', `${this.cancellationRate()}%`],
      ['', ''],
      ['Total invoiced', this.formatCurrency(this.revenueTotal())],
      ['Revenue collected', this.formatCurrency(this.revenueCollected())],
      ['Outstanding', this.formatCurrency(this.revenueOutstanding())]
    ];
    this.downloadCsv(rows, `report_summary_${this.dateFrom}_${this.dateTo}`);
  }

  exportRevenue(): void {
    const headers = ['Name', 'Invoiced', 'Collected', 'Outstanding'];
    const serviceRows = [
      ['--- By Service ---', '', '', ''],
      ...this.revenueByService().map((r) => [
        r.name,
        this.formatCurrency(r.invoiced),
        this.formatCurrency(r.collected),
        this.formatCurrency(r.outstanding)
      ])
    ];
    const dentistRows = [
      ['--- By Dentist ---', '', '', ''],
      ...this.revenueByDentist().map((r) => [
        r.name,
        this.formatCurrency(r.invoiced),
        this.formatCurrency(r.collected),
        this.formatCurrency(r.outstanding)
      ])
    ];
    this.downloadCsv(
      [headers, ...serviceRows, ['', '', '', ''], ...dentistRows],
      `report_revenue_${this.dateFrom}_${this.dateTo}`
    );
  }

  exportByService(): void {
    const headers = ['Service', 'Total', 'Completed', 'Cancelled', 'No-show', 'Completion rate'];
    const rows = this.byService().map((r) => [
      r.name,
      String(r.total),
      String(r.completed),
      String(r.cancelled),
      String(r.noShow),
      `${r.completionRate}%`
    ]);
    this.downloadCsv([headers, ...rows], `report_by_service_${this.dateFrom}_${this.dateTo}`);
  }

  exportByDentist(): void {
    const headers = [
      'Dentist',
      'Total',
      'Completed',
      'Cancelled',
      'No-show',
      'Completion rate',
      'No-show rate'
    ];
    const rows = this.byDentist().map((r) => [
      r.name,
      String(r.total),
      String(r.completed),
      String(r.cancelled),
      String(r.noShow),
      `${r.completionRate}%`,
      `${r.noShowRate}%`
    ]);
    this.downloadCsv([headers, ...rows], `report_by_dentist_${this.dateFrom}_${this.dateTo}`);
  }

  private downloadCsv(rows: string[][], filename: string): void {
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = rows.map((row) => row.map(escape).join(',')).join('\r\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
