import { inject, Injectable } from '@angular/core';
import { Firestore, collection, query, where, getDocs, limit, Timestamp, orderBy } from '@angular/fire/firestore';
import { Functions, httpsCallable } from '@angular/fire/functions';
import { from, map, Observable } from 'rxjs';

export interface IBooking {
  createdAt: Timestamp;
  endDate: string; // YYYY-MM-DD
  endMinutes: number;
  id: string;
  libraryId: string;
  planName?: string;
  seatId: string;
  seatNumber?: string;
  slotTypeId?: string;
  sourceApplicationId?: string;
  startDate: string; // YYYY-MM-DD
  startMinutes: number;
  status: 'confirmed' | 'cancelled' | 'absent';
  updatedAt: Timestamp;
  userId: string;
}

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private firestore = inject(Firestore);
  private functions = inject(Functions);

  constructor() {}

  getTodayBooking(userId: string): Observable<IBooking | null> {
    const today = new Date().toISOString().split('T')[0];
    const bookingsRef = collection(this.firestore, 'bookings');
    // Fetch bookings that might cover today (endDate >= today)
    const q = query(
      bookingsRef,
      where('userId', '==', userId),
      where('endDate', '>=', today),
      where('status', '==', 'confirmed'),
    );

    return from(getDocs(q)).pipe(
      map((snapshot) => {
        if (snapshot.empty) {
          return null;
        }
        // Client-side filter for startDate
        const validDocs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as IBooking);
        const activeBooking = validDocs.find((b) => b.startDate <= today);
        return activeBooking || null;
      }),
    );
  }

  getAllBookings(userId: string): Observable<IBooking[]> {
    const bookingsRef = collection(this.firestore, 'bookings');
    const q = query(bookingsRef, where('userId', '==', userId), orderBy('startDate', 'desc'));

    return from(getDocs(q)).pipe(
      map((snapshot) => {
        return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as IBooking);
      }),
    );
  }

  async cancelBooking(bookingId: string): Promise<any> {
    const cancelFn = httpsCallable(this.functions, 'booking-cancelBooking');
    return cancelFn({ bookingId });
  }
}
