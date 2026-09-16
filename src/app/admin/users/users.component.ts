import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UsersService } from '../../core/services/users.service';
import { CreateUserRequest, UserListItem } from '../../core/models/user.model';
import { MasterDataService } from '../../core/services/master-data.service';
import { MasterDataItem } from '../../core/models/master-data.model';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { CreateUserDialogComponent } from './create-user-dialog/create-user-dialog.component';

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatDialogModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  private readonly usersService = inject(UsersService);
  private readonly masterDataService = inject(MasterDataService);
  private readonly dialog = inject(MatDialog);

  users: UserListItem[] = [];
  filteredUsers: UserListItem[] = [];
  roles: MasterDataItem[] = [];
  isLoading = false;
  errorMessage = '';
  successMessage = '';
  searchTerm = '';
  roleFilter = 'ALL';
  statusFilter = 'ALL';
  sortKey: 'name' | 'email' | 'role' = 'name';

  ngOnInit(): void {
    this.loadUsers();
    this.loadRoles();
  }

  loadRoles(): void {
    this.masterDataService.getOne('userRoles').subscribe({
      next: (response) => {
        this.roles = response.items.filter((item) => item.value !== 'PATIENT');
      }
    });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.usersService.list().subscribe({
      next: (users) => {
        this.users = users;
        this.applyFilters();
        this.errorMessage = '';
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Unable to load users';
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();
    this.filteredUsers = this.users
      .filter((user) => {
        const matchesRole = this.roleFilter === 'ALL' || user.role === this.roleFilter;
        const matchesStatus = this.statusFilter === 'ALL' || String(user.isActive) === this.statusFilter;
        const haystack = [user.name, user.email, user.phone, user.idNumber, user.role].join(' ').toLowerCase();
        return matchesRole && matchesStatus && (!term || haystack.includes(term));
      })
      .sort((a, b) => String(a[this.sortKey] || '').localeCompare(String(b[this.sortKey] || '')));
  }

  openCreateUserDialog(): void {
    this.dialog.open(CreateUserDialogComponent, {
      width: '720px',
      maxWidth: '94vw',
      panelClass: 'dentacare-dialog',
      autoFocus: false,
      data: { roles: this.roles }
    }).afterClosed().subscribe((payload?: CreateUserRequest) => {
      if (!payload) return;
      this.createStaffUser(payload);
    });
  }

  private createStaffUser(payload: CreateUserRequest): void {
    this.successMessage = '';
    this.errorMessage = '';

    this.usersService.create(payload).subscribe({
      next: () => {
        this.successMessage = 'User created successfully';
        this.loadUsers();
      },
      error: (error) => {
        this.errorMessage = error?.error?.message || 'Unable to create user';
      }
    });
  }

  toggleUserStatus(user: UserListItem): void {
    const nextStatus = !user.isActive;

    this.dialog.open(ConfirmDialogComponent, {
      width: '420px',
      maxWidth: '92vw',
      panelClass: 'dentacare-dialog',
      data: {
        title: `${nextStatus ? 'Activate' : 'Deactivate'} user`,
        message: `Are you sure you want to ${nextStatus ? 'activate' : 'deactivate'} ${this.displayName(user)}?`,
        confirmText: nextStatus ? 'Activate' : 'Deactivate'
      }
    }).afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;

      this.usersService.setStatus(user._id, nextStatus).subscribe({
        next: () => {
          this.successMessage = `${this.displayName(user)} was ${nextStatus ? 'activated' : 'deactivated'}`;
          this.loadUsers();
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Unable to update user';
        }
      });
    });
  }

  isSampleUser(user: UserListItem): boolean {
    return user.email?.toLowerCase().endsWith('@dentacare.example') ?? false;
  }

  displayName(user: UserListItem): string {
    return this.isSampleUser(user) ? user.name : this.maskName(user.name);
  }

  displayEmail(user: UserListItem): string {
    return this.isSampleUser(user) ? user.email : this.maskEmail(user.email);
  }

  displayPhone(user: UserListItem): string {
    return this.isSampleUser(user) ? (user.phone || '—') : this.maskPhone(user.phone);
  }

  displayIdNumber(user: UserListItem): string {
    return this.isSampleUser(user) ? (user.idNumber || '—') : this.maskIdNumber(user.idNumber);
  }

  private maskName(value?: string | null): string {
    if (!value?.trim()) return 'User';
    return value.trim().split(/\s+/).map((part) => `${part.charAt(0)}•••`).join(' ');
  }

  private maskEmail(value?: string | null): string {
    if (!value) return '—';
    const [local] = value.split('@');
    return `${local?.charAt(0) || '•'}•••@•••`;
  }

  private maskPhone(value?: string | null): string {
    if (!value) return '—';
    const clean = value.replace(/\s+/g, '');
    return clean.length > 4 ? `${clean.slice(0, 3)}•••••${clean.slice(-2)}` : '••••';
  }

  private maskIdNumber(value?: string | null): string {
    if (!value) return '—';
    return `•••••••••${value.slice(-4)}`;
  }
}
