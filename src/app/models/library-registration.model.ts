import { Timestamp } from '@angular/fire/firestore';

import { IBasicInformation, ILibraryImage, IPricingPlan } from './library.interface';

export interface BookCategory {
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
export interface ILibraryManager {
  address: string;
  email: string;
  experience: string;
  fullName: string;
  maskEmail: boolean;
  photoURL: string;
  visionStatement: string;
}
export interface IRequirement {
  description: string;
  fileURL: string;
  name: string;
  uploadedAt?: Timestamp;
}
export interface ISeat {
  hasPower: boolean;
  id: string;
  isAC?: boolean;
  seatNumber: string;
  status: 'active' | 'maintenance' | 'disabled';
}

export interface IRequirement {
  description: string;
  fileURL: string;
  name: string;
  uploadedAt?: Timestamp;
}

export interface ILibraryRegistrationRequest {
  amenities: string[];
  basicInformation: IBasicInformation;
  bookCollection?: string[];
  createdAt: Timestamp;
  hostProfile: ILibraryManager;
  libraryImages: ILibraryImage[];
  managerIds: string[];
  occupiedSeats: number;
  pricingPlans: IPricingPlan[];
  requirements: IRequirement[];
  seatManagement: ISeat[];
  status: string;
  totalSeats: number;
}
