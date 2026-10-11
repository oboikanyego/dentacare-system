export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | '';

export interface MedicalProfile {
  bloodType?: BloodType;
  allergies?: string[];
  conditions?: string[];
  medications?: string[];
  notes?: string;
}
