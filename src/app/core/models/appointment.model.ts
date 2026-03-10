export interface AppointmentAuditEntry {
  action: string;
  byUserId?: string | null;
  byRole?: string;
  note?: string;
  createdAt?: string;
}

export interface Appointment {
  _id?: string;
  patientId?: string | null;
  patientName: string;
  email: string;
  phone: string;
  idNumber: string;
  serviceId: string;
  serviceName: string;
  dentistId: string;
  dentistName: string;
  branchId?: string;
  branchName?: string;
  date: string;
  slotId: string;
  time: string;
  durationMinutes?: number;
  reason?: string;
  notes?: string;
  internalNotes?: string;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  bookedByRole?: 'PUBLIC' | 'PATIENT' | 'RECEPTIONIST' | 'DENTIST' | 'ADMIN';
  cancelReason?: string;
  cancelledAt?: string | null;
  createdAt?: string;
  auditTrail?: AppointmentAuditEntry[];
}
