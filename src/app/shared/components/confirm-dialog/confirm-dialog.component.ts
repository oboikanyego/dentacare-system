import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  template: `
    <section class="confirm-dialog">
      <div class="confirm-heading">
        <span class="confirm-icon">?</span>
        <div>
          <p class="eyebrow">Please confirm</p>
          <h2 mat-dialog-title>{{ data.title }}</h2>
        </div>
      </div>
      <mat-dialog-content>
        <p>{{ data.message }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-stroked-button type="button" (click)="dialogRef.close(false)">
          {{ data.cancelText || 'Cancel' }}
        </button>
        <button mat-flat-button color="primary" type="button" (click)="dialogRef.close(true)">
          {{ data.confirmText || 'Confirm' }}
        </button>
      </mat-dialog-actions>
    </section>
  `,
  styles: [`
    .confirm-dialog { background:#fff; }
    .confirm-heading { display:flex; gap:.9rem; align-items:center; padding:1.35rem 1.35rem .75rem; border-bottom:1px solid #e8eef2; }
    .confirm-icon { width:2.4rem; height:2.4rem; flex:0 0 2.4rem; display:grid; place-items:center; border-radius:12px; background:#e8f7f4; color:#0f766e; font-weight:900; }
    .eyebrow { margin:0 0 .2rem; color:#0f766e; font-size:.72rem; font-weight:800; letter-spacing:.08em; text-transform:uppercase; }
    h2 { margin:0; padding:0; color:#12313d; font-size:1.35rem; }
    mat-dialog-content { padding:1.2rem 1.35rem !important; }
    mat-dialog-content p { margin:0; color:#607581; line-height:1.6; }
    mat-dialog-actions { gap:.7rem; padding:1rem 1.35rem 1.35rem !important; border-top:1px solid #e8eef2; }
    mat-dialog-actions button { min-width:105px; min-height:42px; border-radius:11px; }
  `]
})
export class ConfirmDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: ConfirmDialogData,
    public readonly dialogRef: MatDialogRef<ConfirmDialogComponent, boolean>
  ) {}
}
