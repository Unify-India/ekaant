
export interface ISeat {
  id: string;
  seatNumber: string;
  isAC: boolean;
  hasPower: boolean;
  status: 'active' | 'maintenance' | 'disabled';
}

export interface ISlotType {
  id: string;
  startTime: string; // e.g., "06:00"
  endTime: string;   // e.g., "10:00"
  durationType: '4h' | '6h' | '12h';
  isPeak: boolean;
}

export interface IPricing {
  id: string;
  durationType: '4h' | '6h' | '12h';
  seatCategory: 'AC' | 'NON_AC';
  basePrice: number;
}

export interface ILibraryConfig {
  seats: ISeat[];
  slotTypes: ISlotType[];
  pricing: IPricing[];
}

export interface IBooking {
    id: string;
    userId: string;
    libraryId: string;
    seatId: string;
    slotTypeId: string;
    bookingDate: string; // YYYY-MM-DD
    status: 'confirmed' | 'cancelled' | 'absent';
    createdAt: FirebaseFirestore.Timestamp;
    updatedAt: FirebaseFirestore.Timestamp;
    seatNumber?: string;
    sourceApplicationId?: string;
}

export interface IAvailabilitySlot {
  totalBooked: number;
  seats?: { [seatId: string]: string }; // seatId: bookingId
}

export interface IAvailableSlotInfo extends ISlotType {
  price: number;
  seatsAvailable: number;
}

// Input data interfaces for Callable functions
export interface IGetLibraryConfigData {
  libraryId: string;
}

export interface IGetAvailableSlotsData {
  libraryId: string;
  date: string; // YYYY-MM-DD
  seatRequirements: { isAC: boolean };
}

export interface IAllocateSeatData {
  libraryId: string;
  date: string; // YYYY-MM-DD
  slotTypeId: string;
  seatRequirements: { isAC: boolean };
}

export interface ICancelBookingData {
  bookingId: string;
}

export interface ICreateSubscriptionData {
  libraryId: string;
  seatRequirements: { isAC: boolean };
  subscriptionDetails: {
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    slotTypeId: string;
  };
}

export interface IManagerApproveSeatData {
  applicationId: string;
  seatId?: string;
  autoAllot?: boolean;
}
