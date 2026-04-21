export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';

export type UrgencyLevel = 'low' | 'medium' | 'high';

export interface BloodRequest {
  id: string;
  bloodType: BloodType;
  amount: number;
  location: string;
  date: string;
  urgency: 'low' | 'medium' | 'high';
  // Optional fields below
  contactName?: string;
  phoneNumbers?: string[];
  description?: string;
}
