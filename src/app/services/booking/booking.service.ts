import { inject, Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs, limit, Timestamp } from '@angular/fire/firestore';
import { from, map, Observable } from 'rxjs';

export interface IBooking {
  bookingDate: string; // YYYY-MM-DD
  createdAt: Timestamp;
  id: string;
  libraryId: string;
  seatId: string;
  seatNumber?: string;
  slotTypeId: string;
  sourceApplicationId?: string;
  status: 'confirmed' | 'cancelled' | 'absent';
  updatedAt: Timestamp;
  userId: string;
}

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private firestore = inject(Firestore);

  constructor() {}

  getTodayBooking(userId: string): Observable<IBooking | null> {
    const today = new Date().toISOString().split('T')[0];
    const bookingsRef = collection(this.firestore, 'bookings');
    const q = query(
      bookingsRef,
      where('userId', '==', userId),
      where('bookingDate', '==', today),
      where('status', '==', 'confirmed'),
      limit(1),
    );

    return from(getDocs(q)).pipe(
      map((snapshot) => {
        if (snapshot.empty) {
          return null;
        }
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() } as IBooking;
      }),
    );
  }
}
