export enum UserRole {
  Student = 'student',
  Manager = 'manager',
  Admin = 'admin',
}

export enum ApplicationStatus {
  Pending = 'pending',
  RevisionRequested = 'revision_requested',
  Approved = 'approved',
  Rejected = 'rejected',
  Waitlisted = 'waitlisted',
}

export enum PaymentStatus {
  Pending = 'pending',
  Completed = 'completed',
  Failed = 'failed',
}
