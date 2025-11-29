export interface ILibraryState {
  // Allow other properties from the library/registration documents
  [key: string]: any;
  applicationStatus: 'approved' | 'pending' | 'rejected' | 'changes-required' | 'none';
}

export interface IFirestoreLibrary {
  [key: string]: any; // Allow other properties
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
  seatManagement?: {
    totalSeats: number;
    occupiedSeats: number;
  };
  status: 'approved' | 'pending' | 'rejected';
}
