import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { IBooking, ISeat, IAllocateSeatData } from "../types/booking";

if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();
const rtdb = admin.database();

/**
 * @function allocateSeat
 * @description HTTPS Callable function to find an available seat, book it atomically, and create a booking record.
 *
 * @param request - The request object from the client.
 * @param request.data.libraryId - The ID of the library.
 * @param request.data.date - The date for the booking (YYYY-MM-DD).
 * @param request.data.slotTypeId - The ID of the slot type to book.
 * @param request.data.seatRequirements - The requirements for the seat (e.g., { isAC: true }).
 * @param request.auth - The authentication information of the user.
 *
 * @returns {Promise<IBooking>} - A promise that resolves with the confirmed booking details.
 * @throws {HttpsError} - Throws for auth errors, invalid arguments, or booking failures (e.g., no seats available).
 */
export const allocateSeat = onCall<IAllocateSeatData, Promise<IBooking>>(async (request) => {
  // 1. Validate authentication
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  const userId = request.auth.uid;
  const { libraryId, date, slotTypeId, seatRequirements } = request.data;

  // 2. Fetch config and identify eligible seats
  const seatsSnapshot = await db.collection("libraries").doc(libraryId).collection("seats").get();
  if (seatsSnapshot.empty) {
    throw new HttpsError("not-found", `Seat configuration not found for library ${libraryId}.`);
  }

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

  // 4. Run RTDB transaction to allocate a seat
  const availabilityRef = rtdb.ref(`availability/${libraryId}/${date}/${slotTypeId}`);

  const transactionResult = await availabilityRef.transaction(currentData => {
    // Initialize if null
    if (currentData === null) {
      currentData = { totalBooked: 0, seats: {} };
    }

    // Check for availability
    if (currentData.totalBooked >= eligibleSeatCount) {
      return; // Abort transaction if full
    }
    
    // Find an available seat
    const bookedSeatIds = Object.keys(currentData.seats || {});
    const availableSeat = eligibleSeats.find(seat => !bookedSeatIds.includes(seat.id));

    if (!availableSeat) {
        // This case should ideally not be hit if totalBooked is correct, but is a good safeguard.
        return; // Abort transaction
    }

    // Allocate the seat
    currentData.totalBooked++;
    if (!currentData.seats) {
        currentData.seats = {};
    }
    currentData.seats[availableSeat.id] = bookingId;

    return currentData;
  });

  // 5. Verify transaction and create Firestore record
  if (!transactionResult.committed) {
    throw new HttpsError("unavailable", "The selected slot was fully booked. Please try another slot.");
  }
  
  const finalSnapshot = transactionResult.snapshot.val();
  // Find the seatId that was just added with our bookingId
  const seatId = Object.keys(finalSnapshot.seats).find(key => finalSnapshot.seats[key] === bookingId);

  if (!seatId) {
      // This indicates a severe logic error or race condition not caught by the transaction
      console.error(`Booking ID ${bookingId} not found in transaction result for ${libraryId}/${date}/${slotTypeId}`);
      throw new HttpsError("internal", "Failed to confirm seat allocation after transaction.");
  }

  const newBooking: IBooking = {
    id: bookingId,
    userId: userId,
    libraryId: libraryId,
    seatId: seatId,
    slotTypeId: slotTypeId,
    bookingDate: date,
    status: 'confirmed',
    createdAt: admin.firestore.FieldValue.serverTimestamp() as FirebaseFirestore.Timestamp,
    updatedAt: admin.firestore.FieldValue.serverTimestamp() as FirebaseFirestore.Timestamp,
  };

  await bookingRef.set(newBooking);

  // 6. Return confirmation
  // We need to fetch the created booking to get server timestamps
  const createdBooking = await bookingRef.get();
  return createdBooking.data() as IBooking;
});
