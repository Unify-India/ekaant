export interface IMenuOptions {
  color?: string;
  icon: string;
  title: string;
  url: string;
}

export interface IUser {
  bookingPreference?: 'ac' | 'non-ac';
  createdAt: Date;
  email: string;
  fullAddress?: string;
  idDocumentUrl?: string;
  idNumber?: string;
  linkedLibraryId?: string;
  managedLibraryIds?: string[];
  name: string;
  phoneNumber?: string;
  preferredEndTime?: string;
  preferredStartTime?: string;
  primaryLibraryId?: string;
  profileCompleted?: boolean;
  profileCompletion?: number;
  role: string | 'admin' | 'manager' | 'student';
  subscriptionExpiry: Date;
  uid: string;
  verified: boolean;
}
