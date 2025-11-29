import { Timestamp } from 'firebase-admin/firestore';
import { ApplicationStatus, PaymentStatus, UserRole } from './enums';

// Base interface for all documents
interface BaseDoc {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Collections

interface User extends BaseDoc {
  role: UserRole;
  name: string;
  email: string;
  phone: string;
  verificationStatus: boolean;
  linkedLibraryId?: string; // For students
  managedLibraryIds?: string[]; // For managers
}

interface Library extends BaseDoc {
  name: string;
  ownerId: string; // userId of the primary owner
  managerIds: string[]; // array of userIds
  location: {
    address: string;
    city: string;
    pincode: string;
    mapUrl?: string;
  };
  seatConfig: {
    totalSeats: number;
    slots: {
      slotType: string; // e.g., '4hr', '8hr', 'day'
      price: number;
    }[];
  };
  status: 'approved' | 'pending' | 'rejected';
}

interface LibraryRegistrationRequest extends BaseDoc {
  userId: string; // The user who submitted the request
  libraryName: string;
  managerName: string;
  managerEmail: string;
  managerPhone: string;
  address: string;
  city: string;
  pincode: string;
  totalSeats: number;
  status: ApplicationStatus;
  adminComments?: string;
}

interface StudentApplication extends BaseDoc {
  studentId: string;
  libraryId: string;
  status: ApplicationStatus;
  conflictFlag: boolean;
}

interface Payment extends BaseDoc {
  studentId: string;
  libraryId: string;
  amount: number;
  mode: 'cash' | 'online';
  status: PaymentStatus;
}

interface AttendanceLog extends BaseDoc {
  studentId: string;
  libraryId: string;
  seatNo: number;
  checkIn: Timestamp;
  checkOut?: Timestamp;
  durationInMinutes?: number;
  quotaDeducted: boolean;
  overOccupancy: boolean;
}

interface WaitingListEntry extends BaseDoc {
  studentId: string;
  libraryId: string;
  position: number;
  expiresAt: Timestamp;
  status: 'active' | 'expired' | 'converted';
}

interface Feedback extends BaseDoc {
  userId: string;
  role: UserRole;
  message: string;
  isAnonymous: boolean;
  status: 'new' | 'in_progress' | 'resolved';
}

interface Report extends BaseDoc {
  libraryId: string;
  date: Timestamp;
  utilization: {
    peakHours: Record<string, number>;
    averageOccupancy: number;
  };
  paymentsSummary: {
    totalAmount: number;
    totalTransactions: number;
  };
  waitingListCount: number;
}
