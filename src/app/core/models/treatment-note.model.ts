export interface TreatmentNote {
  _id?: string;
  appointmentId: string;
  patientId?: string | null;
  patientEmail: string;
  dentistId: string;
  dentistName: string;
  serviceId: string;
  serviceName: string;
  date: string;
  diagnosis?: string;
  treatment?: string;
  prescription?: string;
  followUpDate?: string | null;
  notes?: string;
  createdByUserId?: string;
  createdByRole?: string;
  createdAt?: string;
}
