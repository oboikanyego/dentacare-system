import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { TreatmentNote } from '../../core/models/treatment-note.model';
import { TreatmentNoteService } from '../../core/services/treatment-note.service';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';

interface RecallNote extends TreatmentNote {
  overdue: boolean;
}

@Component({
  selector: 'app-recall',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './recall.component.html',
  styleUrl: './recall.component.css'
})
export class RecallComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly treatmentNoteService = inject(TreatmentNoteService);
  private readonly uiFeedback = inject(UiFeedbackService);

  readonly isLoading = signal(false);
  readonly errorMessage = signal('');
  readonly notes = signal<RecallNote[]>([]);
  readonly windowDays = signal(7);

  readonly overdue = computed(() => this.notes().filter((n) => n.overdue));
  readonly upcoming = computed(() => this.notes().filter((n) => !n.overdue));

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');
    this.treatmentNoteService
      .getFollowUps(this.windowDays())
      .pipe(
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (data) => this.notes.set(data as RecallNote[]),
        error: (err) => {
          const msg = err?.error?.message || 'Unable to load follow-up data.';
          this.errorMessage.set(msg);
          this.uiFeedback.error(msg);
        }
      });
  }

  setWindow(days: number): void {
    this.windowDays.set(days);
    this.load();
  }

  daysUntil(dateStr: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr + 'T00:00:00');
    return Math.round((target.getTime() - today.getTime()) / 86400000);
  }

  daysDiff(dateStr: string): string {
    const diff = this.daysUntil(dateStr);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff === -1) return '1 day ago';
    if (diff < 0) return `${Math.abs(diff)} days ago`;
    return `In ${diff} days`;
  }
}
