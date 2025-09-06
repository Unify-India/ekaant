export interface Library {
  id?: string | number;
  name: string;
  address: string;
  availableSeats: number;
  totalSeats: number;
  isFull: boolean;
}
