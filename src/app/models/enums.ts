export enum UserRole {
  Student = 'student',
  Manager = 'manager',
  Admin = 'admin',
}

export enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Suspended = 'suspended',
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

export enum Shift {
  Morning4h = 'morning_4h', // 06:00 - 10:00
  Afternoon4h = 'afternoon_4h', // 10:00 - 14:00
  Evening4h = 'evening_4h', // 14:00 - 18:00
  Night4h = 'night_4h', // 18:00 - 22:00
  Morning6h = 'morning_6h', // 06:00 - 12:00
  Afternoon6h = 'afternoon_6h', // 12:00 - 18:00
  FullDay12h = 'fullday_12h', // 08:00 - 20:00
  FullDay16h = 'fullday_16h', // 06:00 - 22:00
}
