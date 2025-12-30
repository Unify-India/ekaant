import { Timestamp } from '@angular/fire/firestore';
import { UserRole, UserStatus } from './enums';

export interface SubscriptionDetails {
  planId?: string;
  planName?: string;
  billingCycle: 'monthly' | 'quarterly' | 'yearly';
  amount: number;
  startDate: Timestamp | Date;
  endDate?: Timestamp | Date;
  paymentDate?: Timestamp | Date;
  startTime?: string;
  endTime?: string;
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  phoneNumber?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Timestamp | Date;
  updatedAt?: Timestamp | Date;
  
  // Profile Details
  address?: string;
  idCardNumber?: string;
  acPreference?: boolean;
  
  // For library context
  libraryId?: string;
  currentSubscription?: SubscriptionDetails;
  associatedLibraries?: {
    enrolled: string | null; // Currently enrolled library ID
    applied: string[]; // Library IDs where application is pending
    previous: string[]; // Library IDs of past enrollments
  };
}