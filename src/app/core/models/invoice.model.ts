export interface InvoiceLineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type InvoiceStatus = 'UNPAID' | 'PAID' | 'CANCELLED';
export type PaymentMethod = 'CASH' | 'CARD' | 'EFT' | 'INSURANCE' | 'OTHER' | '';

export interface Invoice {
  _id?: string;
  invoiceNumber?: string;
  appointmentId: string;
  patientId?: string | null;
  patientEmail: string;
  patientName: string;
  patientPhone?: string;
  dentistId?: string;
  dentistName?: string;
  serviceId?: string;
  serviceName?: string;
  branchId?: string;
  branchName?: string;
  date: string;
  items: InvoiceLineItem[];
  subtotal: number;
  taxRate?: number;
  taxAmount?: number;
  total: number;
  status: InvoiceStatus;
  dueDate?: string | null;
  paidAt?: string | null;
  paymentMethod?: PaymentMethod;
  notes?: string;
  createdByUserId?: string;
  createdByRole?: string;
  createdAt?: string;
  updatedAt?: string;
}
