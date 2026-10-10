import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { finalize } from 'rxjs';
import { MasterDataItem } from '../../core/models/master-data.model';
import { MasterDataService, MasterDataListResponse } from '../../core/services/master-data.service';
import { UiFeedbackService } from '../../core/services/ui-feedback.service';

interface CollectionView {
  key: string;
  description: string;
  items: MasterDataItem[];
}

const EDITABLE_KEYS = ['services', 'branches', 'timeSlots', 'dentists'];

@Component({
  selector: 'app-admin-master-data',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './master-data.component.html',
  styleUrl: './master-data.component.css'
})
export class AdminMasterDataComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly masterDataService = inject(MasterDataService);
  private readonly uiFeedback = inject(UiFeedbackService);
  private readonly destroyRef = inject(DestroyRef);

  readonly collections = signal<CollectionView[]>([]);
  readonly activeKey = signal<string>('services');
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly errorMessage = signal('');
  readonly addingNew = signal(false);
  readonly editingItem = signal<MasterDataItem | null>(null);

  readonly DAY_OPTIONS = [
    { value: 1, label: 'Mon' },
    { value: 2, label: 'Tue' },
    { value: 3, label: 'Wed' },
    { value: 4, label: 'Thu' },
    { value: 5, label: 'Fri' },
    { value: 6, label: 'Sat' },
    { value: 0, label: 'Sun' }
  ];

  readonly addForm = this.fb.group({
    value: ['', [Validators.required, Validators.pattern(/^[a-z0-9-_]+$/)]],
    label: ['', Validators.required],
    sortOrder: [0],
    specialization: [''],
    workingDays: [this.fb.array([])]
  });

  readonly editForm = this.fb.group({
    label: ['', Validators.required],
    isActive: [true],
    sortOrder: [0],
    specialization: [''],
    workingDays: [this.fb.array([])]
  });

  addWorkingDays: number[] = [1, 2, 3, 4, 5];
  editWorkingDays: number[] = [1, 2, 3, 4, 5];

  get isDentists(): boolean {
    return this.activeKey() === 'dentists';
  }

  toggleAddDay(day: number): void {
    const idx = this.addWorkingDays.indexOf(day);
    if (idx >= 0) {
      this.addWorkingDays = this.addWorkingDays.filter((d) => d !== day);
    } else {
      this.addWorkingDays = [...this.addWorkingDays, day].sort();
    }
  }

  toggleEditDay(day: number): void {
    const idx = this.editWorkingDays.indexOf(day);
    if (idx >= 0) {
      this.editWorkingDays = this.editWorkingDays.filter((d) => d !== day);
    } else {
      this.editWorkingDays = [...this.editWorkingDays, day].sort();
    }
  }

  isAddDaySelected(day: number): boolean {
    return this.addWorkingDays.includes(day);
  }

  isEditDaySelected(day: number): boolean {
    return this.editWorkingDays.includes(day);
  }

  get activeCollection(): CollectionView | undefined {
    return this.collections().find((c) => c.key === this.activeKey());
  }

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    let remaining = EDITABLE_KEYS.length;
    const results: CollectionView[] = [];

    EDITABLE_KEYS.forEach((key) => {
      this.masterDataService
        .search(key, '', 50)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (res) => {
            results.push({ key: res.key, description: res.description, items: res.items });
            remaining--;
            if (remaining === 0) {
              this.collections.set(
                EDITABLE_KEYS.map((k) => results.find((r) => r.key === k)!).filter(Boolean)
              );
              this.isLoading.set(false);
            }
          },
          error: () => {
            remaining--;
            if (remaining === 0) this.isLoading.set(false);
          }
        });
    });
  }

  selectKey(key: string): void {
    this.activeKey.set(key);
    this.addingNew.set(false);
    this.editingItem.set(null);
    this.addForm.reset({ value: '', label: '', sortOrder: 0 });
  }

  startAdd(): void {
    this.addingNew.set(true);
    this.editingItem.set(null);
    this.addWorkingDays = [1, 2, 3, 4, 5];
    this.addForm.reset({
      value: '',
      label: '',
      sortOrder: (this.activeCollection?.items.length ?? 0) + 1,
      specialization: ''
    });
  }

  cancelAdd(): void {
    this.addingNew.set(false);
    this.addForm.reset();
  }

  submitAdd(): void {
    if (this.addForm.invalid) {
      this.addForm.markAllAsTouched();
      return;
    }

    const { value, label, sortOrder, specialization } = this.addForm.getRawValue();
    const metadata: Record<string, unknown> = {};
    if (this.isDentists) {
      if (specialization) metadata['specialization'] = specialization;
      metadata['schedule'] = { workingDays: this.addWorkingDays };
    }
    this.isSaving.set(true);

    this.masterDataService
      .addItem(this.activeKey(), {
        value: value!,
        label: label!,
        sortOrder: sortOrder ?? 0,
        metadata: Object.keys(metadata).length ? metadata : undefined
      })
      .pipe(
        finalize(() => this.isSaving.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (res) => {
          this.uiFeedback.success('Item added');
          this.addingNew.set(false);
          this.addForm.reset();
          this.replaceCollection(res);
        },
        error: (err) => {
          this.uiFeedback.error(err?.error?.message || 'Failed to add item');
        }
      });
  }

  startEdit(item: MasterDataItem): void {
    this.editingItem.set(item);
    this.addingNew.set(false);
    const existingDays: number[] = item.metadata?.['schedule']?.['workingDays'] ?? [1, 2, 3, 4, 5];
    this.editWorkingDays = [...existingDays];
    this.editForm.patchValue({
      label: item.label,
      isActive: item.isActive !== false,
      sortOrder: item.sortOrder ?? 0,
      specialization: (item.metadata?.['specialization'] as string) ?? ''
    });
  }

  cancelEdit(): void {
    this.editingItem.set(null);
  }

  submitEdit(): void {
    const item = this.editingItem();
    if (!item || this.editForm.invalid) return;

    const { label, isActive, sortOrder, specialization } = this.editForm.getRawValue();
    const updates: Parameters<typeof this.masterDataService.updateItem>[2] = {
      label: label!,
      isActive: isActive!,
      sortOrder: sortOrder ?? 0
    };
    if (this.isDentists) {
      const metadata: Record<string, unknown> = { ...(item.metadata as Record<string, unknown>) };
      if (specialization) metadata['specialization'] = specialization;
      metadata['schedule'] = { workingDays: this.editWorkingDays };
      updates.metadata = metadata;
    }
    this.isSaving.set(true);

    this.masterDataService
      .updateItem(this.activeKey(), item.value, updates)
      .pipe(
        finalize(() => this.isSaving.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (res) => {
          this.uiFeedback.success('Item updated');
          this.editingItem.set(null);
          this.replaceCollection(res);
        },
        error: (err) => {
          this.uiFeedback.error(err?.error?.message || 'Failed to update item');
        }
      });
  }

  deactivate(item: MasterDataItem): void {
    if (!confirm(`Deactivate "${item.label}"?`)) return;

    this.masterDataService
      .deactivateItem(this.activeKey(), item.value)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.uiFeedback.success('Item deactivated');
          this.reloadCurrent();
        },
        error: (err) => {
          this.uiFeedback.error(err?.error?.message || 'Failed to deactivate item');
        }
      });
  }

  private reloadCurrent(): void {
    this.masterDataService
      .search(this.activeKey(), '', 50)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: (res) => this.replaceCollection(res) });
  }

  private replaceCollection(res: MasterDataListResponse): void {
    this.collections.update((cols) =>
      cols.map((c) =>
        c.key === res.key ? { key: res.key, description: res.description, items: res.items } : c
      )
    );
  }

  collectionLabel(key: string): string {
    const map: Record<string, string> = {
      services: 'Services',
      branches: 'Branches',
      timeSlots: 'Time Slots',
      dentists: 'Dentists'
    };
    return map[key] ?? key;
  }
}
