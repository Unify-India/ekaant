import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { IBooking, ICancelBookingData } from "../types/booking";

if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();
const rtdb = admin.database();

/**
 * @function cancelBooking
 * @description HTTPS Callable function to cancel a booking. It de-allocates the seat in RTDB and updates the booking status in Firestore.
 *
 * @param request - The request object from the client.
 * @param request.data.bookingId - The ID of the booking to be cancelled.
 * @param request.auth - The authentication information of the user.
 *
 * @returns {Promise<{success: boolean, message: string}>} - A promise that resolves with a success message.
 * @throws {HttpsError} - Throws for auth errors, invalid arguments, or if the booking cannot be cancelled.
 */
export const cancelBooking = onCall<ICancelBookingData, Promise<{success: boolean, message: string}>>(async (request) => {
  // 1. Validate authentication and input
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
  }
  const userId = request.auth.uid;
  const { bookingId } = request.data;

  // 2. Fetch the booking from Firestore
  const bookingRef = db.collection("bookings").doc(bookingId);
  const bookingDoc = await bookingRef.get();

  if (!bookingDoc.exists) {
    throw new HttpsError("not-found", `Booking with ID ${bookingId} not found.`);
  }

  const booking = bookingDoc.data() as IBooking;

  // 3. Authorize the user
  // For now, only the user who made the booking can cancel it.
  if (booking.userId !== userId) {
    throw new HttpsError("permission-denied", "You are not authorized to cancel this booking.");
  }

  // Check if booking is already cancelled
  if (booking.status !== 'confirmed') {
    throw new HttpsError("failed-precondition", `Booking is already in '${booking.status}' state and cannot be cancelled.`);
  }

  const { libraryId, bookingDate, slotTypeId, seatId } = booking;
  
  // 4. De-allocate the seat in Realtime Database via transaction
  const availabilityRef = rtdb.ref(`availability/${libraryId}/${bookingDate}/${slotTypeId}`);

  await availabilityRef.transaction(currentData => {
    if (currentData === null) {
      // Data is missing in RTDB. Log it but proceed to update Firestore.
      console.warn(`RTDB availability data missing for path: ${availabilityRef.toString()}`);
      return null;
    }
    // Check if the specific seat booking exists before modifying
    if (currentData.seats && currentData.seats[seatId] === bookingId) {
        currentData.totalBooked--;
        delete currentData.seats[seatId];
    } else {
        console.warn(`Booking ${bookingId} for seat ${seatId} not found in RTDB at path: ${availabilityRef.toString()}`);
    }
    return currentData;
  });

  // 5. Update the booking status in Firestore
  await bookingRef.update({
    status: 'cancelled',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, message: "Booking cancelled successfully." };
});
