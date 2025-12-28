import { Timestamp } from '@angular/fire/firestore';

import {
  IBasicInformation,
  ILibraryImage,
  IManagerProfile,
  IPricingPlan,
  IRequirement,
  ISeatManagement,
} from './library.interface';

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

export interface ILibraryRegistrationRequest {
  amenities: string[];
  basicInformation: IBasicInformation;
  bookCollection?: string[] | { [key: string]: boolean };
  codeOfConduct?: string;
  createdAt: string;
  hostProfile: IManagerProfile;
  libraryImages: ILibraryImage[];
  managerIds: string[];
  occupiedSeats: number;
  pricingPlans: IPricingPlan[];
  requirements: IRequirement[];
  seatManagement: ISeatManagement;
  status: string;
  totalSeats: number;
}
