export interface ILibraryState {
  applicationStatus: 'approved' | 'pending' | 'rejected' | 'changes-required' | 'none';
  // Allow other properties from the library/registration documents
  [key: string]: any;
}

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
  seatManagement?: {
    totalSeats: number;
  };
  realtimeStats?: {
    availableSeats: number;
  };
  libraryImages?: {
    libraryPhotos: { previewUrl: string }[];
  };
  status: 'approved' | 'pending' | 'rejected';
  [key: string]: any; // Allow other properties
}