import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { UsersService } from '../../core/services/users.service';
import { CreateUserRequest, UserListItem } from '../../core/models/user.model';
import { MasterDataService } from '../../core/services/master-data.service';
import { MasterDataItem } from '../../core/models/master-data.model';

@Component({
  selector: 'app-admin-users-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly usersService = inject(UsersService);
  private readonly masterDataService = inject(MasterDataService);

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

  readonly staffForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.pattern(/^(?:\+27|0)[6-8][0-9]{8}$/)]],
    idNumber: ['', [Validators.required, Validators.pattern(/^\d{13}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    role: ['RECEPTIONIST'],
    isActive: [true]
  });

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

  createStaffUser(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.staffForm.invalid) {
      this.staffForm.markAllAsTouched();
      return;
    }

    this.usersService.create(this.staffForm.getRawValue() as CreateUserRequest).subscribe({
      next: () => {
        this.successMessage = 'User created successfully';
        this.staffForm.reset({ name: '', email: '', phone: '', idNumber: '', password: '', role: 'RECEPTIONIST', isActive: true });
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
    if (!confirmed) {
      return;
    }

    this.usersService.setStatus(user._id, nextStatus).subscribe({
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
