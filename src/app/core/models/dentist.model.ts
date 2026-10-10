export interface DentistSchedule {
  workingDays: number[];
}

export interface DentistAvailability {
  dentistId: string;
  schedule: DentistSchedule;
}

export interface Dentist {
  _id: string;
  name: string;
  specialization: string;
  email?: string;
  phone?: string;
  image?: string;
}
