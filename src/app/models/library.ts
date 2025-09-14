export interface Library {
  address: string;
  availableSeats: number;
  id?: string | number;
  isFull: boolean;
  name: string;
  totalSeats: number;
  type: string;
}

export interface ReviewTag {
  text: string;
  type: 'positive' | 'negative' | 'neutral';
}

export interface Review {
  comment: string;
  isVerified: boolean;
  name: string;
  rating: number;
  tags?: ReviewTag[];
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
