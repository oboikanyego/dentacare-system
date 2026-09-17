import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { EMPTY, finalize, switchMap } from 'rxjs';
import { MasterDataItem } from '../../core/models/master-data.model';
import { CreateUserRequest, UserListItem } from '../../core/models/user.model';
import { MasterDataService } from '../../core/services/master-data.service';
import { UsersService } from '../../core/services/users.service';
import { CreateStaffDialogComponent } from './create-staff-dialog.component';

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
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
    this.masterDataService
      .getOne('userRoles')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response) => {
          this.roles = response.items.filter((item) => item.value !== 'PATIENT');
        },
        error: () => {
          this.roles = [];
        }
      });
  }

  loadUsers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.usersService
      .list()
      .pipe(
        finalize(() => {
          this.isLoading = false;
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (users) => {
          this.users = users;
          this.applyFilters();
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Unable to load users';
        }
      });
  }

  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredUsers = this.users
      .filter((user) => {
        const matchesRole = this.roleFilter === 'ALL' || user.role === this.roleFilter;
        const matchesStatus =
          this.statusFilter === 'ALL' || String(user.isActive) === this.statusFilter;
        const haystack = [user.name, user.email, user.phone, user.idNumber, user.role]
          .join(' ')
          .toLowerCase();

        return matchesRole && matchesStatus && (!term || haystack.includes(term));
      })
      .sort((a, b) =>
        String(a[this.sortKey] || '').localeCompare(String(b[this.sortKey] || ''))
      );
  }

  openCreateStaffDialog(): void {
    this.dialog
      .open(CreateStaffDialogComponent, {
        width: '760px',
        maxWidth: '95vw',
        autoFocus: false,
        data: { roles: this.roles }
      })
      .afterClosed()
      .pipe(
        switchMap((payload?: CreateUserRequest) =>
          payload ? this.usersService.create(payload) : EMPTY
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => {
          this.successMessage = 'Staff user created successfully';
          this.loadUsers();
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Unable to create user';
        }
      });
  }

  toggleUserStatus(user: UserListItem): void {
    const nextStatus = !user.isActive;
    const confirmed = window.confirm(`${nextStatus ? 'Activate' : 'Deactivate'} ${user.name}?`);
    if (!confirmed) return;

    this.usersService
      .setStatus(user._id, nextStatus)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.successMessage = `${user.name} was ${nextStatus ? 'activated' : 'deactivated'}`;
          this.loadUsers();
        },
        error: (error) => {
          this.errorMessage = error?.error?.message || 'Unable to update user';
        }
      });
  }
}
