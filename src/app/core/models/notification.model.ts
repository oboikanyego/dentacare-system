export type NotificationType =
  | 'APPOINTMENT_PENDING'
  | 'APPOINTMENT_CONFIRMED'
  | 'APPOINTMENT_CANCELLED'
  | 'APPOINTMENT_RESCHEDULED'
  | 'INVOICE_CREATED'
  | 'TREATMENT_NOTE_CREATED';

export interface AppNotification {
  _id?: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  appointmentId?: string | null;
  isRead: boolean;
  createdAt?: string;
  updatedAt?: string;
}
