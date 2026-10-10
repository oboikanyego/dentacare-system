import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TreatmentNote } from '../../core/models/treatment-note.model';
import { TreatmentNoteService } from '../../core/services/treatment-note.service';

@Component({
  selector: 'app-patient-treatment-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patient-treatment-history.component.html',
  styleUrl: './patient-treatment-history.component.css'
})
export class PatientTreatmentHistoryComponent implements OnInit {
  private readonly treatmentNoteService = inject(TreatmentNoteService);
  private readonly destroyRef = inject(DestroyRef);

  readonly notes = signal<TreatmentNote[]>([]);
  readonly isLoading = signal(true);
  readonly errorMessage = signal('');
  expandedId = signal<string | null>(null);

  ngOnInit(): void {
    this.treatmentNoteService
      .listMine()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => {
          this.notes.set(list);
          this.isLoading.set(false);
        },
        error: () => {
          this.errorMessage.set('Unable to load treatment history.');
          this.isLoading.set(false);
        }
      });
  }

  toggle(id: string): void {
    this.expandedId.set(this.expandedId() === id ? null : id);
  }
}
