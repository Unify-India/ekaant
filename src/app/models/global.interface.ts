export interface IMenuOptions {
  color?: string;
  icon: string;
  title: string;
  url: string;
}

export interface IUser {
  createdAt: Date;
  email: string;
  linkedLibraryId?: string;
  managedLibraryIds?: string[];
  name: string;
  profileCompleted: boolean;
  role: string | 'admin' | 'manager' | 'student';
  subscriptionExpiry: Date;
  uid: string;
  verified: boolean;
}
