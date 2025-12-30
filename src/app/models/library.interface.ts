import { Timestamp } from '@angular/fire/firestore';

export interface ILibraryState {
  applicationStatus: 'approved' | 'pending' | 'rejected' | 'changes-required' | 'none';
}

export interface IPricingPlan {
  description?: string;
  planName: string;
  planType: string;
  rate: number;
  timeSlot: string;
}
export interface Library {
  address: string;
  id?: string | number;
  name: string;
  occupiedSeats: number;
  photoURL?: string | null;
  totalSeats: number;
  type: string;
}

export interface IReviewTag {
  text: string;
  type: 'positive' | 'negative' | 'neutral';
}

export interface Review {
  comment: string;
  isVerified: boolean;
  name: string;
  rating: number;
  tags?: IReviewTag[];
  timestamp: string;
}

export interface IAmenities {
  amenityName: string;
  icon?: string;
  isAvailable: boolean;
}

export interface IPricingDetails {
  amenities: IAmenities[];
  price: number;
  pricingName: string;
  pricingType: string;
  shift?: string;
  timeRange?: string;
  unit: string;
}

export interface IAttendanceRecord {
  date: string;
  duration?: string;
  status: 'Completed' | 'Absent';
  timeRange: string;
}

export interface IBasicInformation {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  genderCategory: string;
  libraryName: string;
  mapUrl?: string;
  operatingHoursEnd: string;
  operatingHoursStart: string;
  state: string;
  zipCode: string;
}

export interface IManagerProfile {
  address: string;
  email: string;
  experience: string;
  fullName: string;
  maskEmail: boolean;
  maskPhoneNumber: boolean;
  phoneNumber: number;
  photoURL: string;
  visionStatement: string;
}

export interface ISeat {
  hasPower: boolean;
  id: string;
  isAC?: boolean;
  seatNumber: string;
  status: 'active' | 'maintenance' | 'disabled';
}

export interface ISeatManagement {
  facilityRanges?: { from: number; to: number; facility: string }[];
  seats: ISeat[];
}

export interface ILibraryImage {
  caption?: string;
  imageURL: string;
  order: number;
  uploadedAt: string;
  uploadedBy: string;
}

export interface IRequirement {
  attachSample?: boolean;
  description: string;
  fileURL: string;
  isCustom?: boolean;
  name: string;
  uploadedAt?: Timestamp;
}

export interface ILibraryRating {
  averageRating: number;
  breakdown?: { stars: number; count: number }[];
  totalReviews: number;
}

export interface IReview {
  comment?: string;
  isVerified: boolean;
  rating: number;
  tags?: IReviewTag[];
  timestamp: string;
  userId: string;
  userName?: string;
}

export interface IApprovalComment {
  authorName: string;
  role: string;
  text: string;
  timestamp: Timestamp;
}
export interface IBookCategory {
  name: string;
  selected: boolean;
}

export interface IRegistrationStep {
  color: string;
  description: string;
  icon: string;
  id: number;
  title: string;
}

export interface IFeatureCard {
  color: string;
  description: string;
  icon: string;
  id: number;
  title: string;
}

export interface ILibraryRegistrationRequest {
  amenities: string[];
  applicationStatus: string;
  basicInformation: IBasicInformation;
  bookCollection?: string[] | { [key: string]: boolean };
  codeOfConduct?: string;
  createdAt: Timestamp | string;
  hostProfile: IManagerProfile;
  libraryImages: ILibraryImage[];
  managerIds: string[];
  occupiedSeats: number;
  ownerId: string;
  pricingPlans: IPricingPlan[];
  requirements: IRequirement[];
  seatManagement: ISeatManagement;
  status: string;
  totalSeats: number;
  updatedAt: Timestamp | string;
}

export interface ILibrary extends ILibraryRegistrationRequest {
  comments?: IApprovalComment[];
  id?: string;
  rating?: ILibraryRating;
  reviews?: IReview[];
}
