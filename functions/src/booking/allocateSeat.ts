import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { IBooking, ISeat, IAllocateSeatData } from "../types/booking";
import { DEPLOYMENT_REGION } from "../config";
import { timeToMinutes, isOverlap } from "../utils/time";

if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();
const rtdb = admin.database();

/**
 * @function allocateSeat
 * @description HTTPS Callable function to find an available seat, book it atomically, and create a booking record.
 * Refactored to use minute-based time ranges and per-seat availability.
 * Now accepts dynamic startTime/endTime.
 */
export const allocateSeat = onCall<IAllocateSeatData, Promise<IBooking>>({ region: DEPLOYMENT_REGION }, async (request) => {
  // 1. Validate authentication
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  const userId = request.auth.uid;
  const { libraryId, date, startTime, endTime, seatRequirements, slotTypeId } = request.data;

  if (!startTime || !endTime) {
      throw new HttpsError("invalid-argument", "startTime and endTime are required.");
  }

  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  if (isNaN(startMinutes) || isNaN(endMinutes)) {
      throw new HttpsError("invalid-argument", "Invalid time format (HH:MM expected).");
  }

  // 2. Fetch config (Seats only)
  const libraryRef = db.collection("libraries").doc(libraryId);
  const seatsSnapshot = await libraryRef.collection("seats").get();

  if (seatsSnapshot.empty) {
    throw new HttpsError("not-found", `Seat configuration not found for library ${libraryId}.`);
  }

  // Filter Eligible Seats
  const eligibleSeats = seatsSnapshot.docs
    .map(doc => ({ id: doc.id, ...doc.data() } as ISeat))
    .filter(seat => seat.isAC === seatRequirements.isAC && seat.status === 'active');

  const eligibleSeatCount = eligibleSeats.length;
  if (eligibleSeatCount === 0) {
    throw new HttpsError("not-found", "No seats match the specified requirements.");
  }

  // 3. Generate a new booking ID for atomicity
  const bookingRef = db.collection("bookings").doc();
  const bookingId = bookingRef.id;

  // 4. Find Available Seat (Iterate and Transaction)
  let allocatedSeat: ISeat | null = null;
  const timeKey = `${startMinutes}_${endMinutes}`;

  for (const seat of eligibleSeats) {
      const seatAvailabilityRef = rtdb.ref(`availability/${libraryId}/${date}/${seat.id}`);
      
      const transactionResult = await seatAvailabilityRef.transaction(currentBookings => {
          if (currentBookings === null) {
              return { [timeKey]: bookingId }; // Initialize with our booking
          }

          // Check overlap
          for (const key of Object.keys(currentBookings)) {
              const [existStart, existEnd] = key.split('_').map(Number);
              if (isOverlap(startMinutes, endMinutes, existStart, existEnd)) {
                  return; // Abort transaction (return undefined)
              }
          }

          // No overlap
          currentBookings[timeKey] = bookingId;
          return currentBookings;
      });

      if (transactionResult.committed) {
          allocatedSeat = seat;
          break; // Stop looking, we found one!
      }
  }

  if (!allocatedSeat) {
      throw new HttpsError("unavailable", "No seats available for the selected time slot.");
  }

  // 5. Create Firestore Record
  const newBooking: IBooking = {
    id: bookingId,
    userId: userId,
    libraryId: libraryId,
    seatId: allocatedSeat.id,
    slotTypeId, // Optional
    startDate: date,
    endDate: date,
    status: 'confirmed',
    createdAt: FieldValue.serverTimestamp() as FirebaseFirestore.Timestamp,
    updatedAt: FieldValue.serverTimestamp() as FirebaseFirestore.Timestamp,
    startMinutes,
    endMinutes,
    seatNumber: allocatedSeat.seatNumber
  };

  await bookingRef.set(newBooking);

  // 6. Return confirmation
  const createdBooking = await bookingRef.get();
  return createdBooking.data() as IBooking;
});
