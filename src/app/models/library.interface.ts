export interface ILibraryState {
  // Allow other properties from the library/registration documents
  [key: string]: any;
  applicationStatus: 'approved' | 'pending' | 'rejected' | 'changes-required' | 'none';
}

export interface IPricingPlan {
  description?: string;
  planName: string;
  planType: string;
  rate: number;
  timeSlot: string;
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
  photoUrl: string;
  visionStatement: string;
}
export interface ISeatManagement {}
export interface I {}
export interface I {}
export interface I {}
export interface I {}
export interface I {}
export interface I {}
export interface IFirestoreLibrary {
  basicInformation: {
    libraryName: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    zipCode: string;
    genderCategory: string;
  };
  hostProfile?: {
    fullName: string;
  };
  libraryImages?: {
    libraryPhotos: { previewUrl: string }[];
  };
  pricingPlans?: IPricingPlan[];
  seatManagement?: {
    totalSeats: number;
    occupiedSeats: number;
  };
  status: 'approved' | 'pending' | 'rejected';
}

export interface ILibrary {
  basicInformation: IBasicInformation;
  managerProfile: IManagerProfile;
  occupiedSeats: number;
  pricingPlans: IPricingPlan[];
  seatManagement: {};
  status: 'approved' | 'pending' | 'rejected';
  totalSeats: number;
}
