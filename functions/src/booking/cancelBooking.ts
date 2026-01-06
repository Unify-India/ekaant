import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { IBooking, ICancelBookingData } from "../types/booking";
import { DEPLOYMENT_REGION } from "../config";

if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();
const rtdb = admin.database();

/**
 * @function cancelBooking
 * @description HTTPS Callable function to cancel a booking. It de-allocates the seat in RTDB and updates the booking status in Firestore.
 * Refactored for multi-day single-document bookings.
 */
export const cancelBooking = onCall<ICancelBookingData, Promise<{success: boolean, message: string}>>(
  { region: DEPLOYMENT_REGION },
  async (request) => {
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
  if (booking.userId !== userId) {
    throw new HttpsError("permission-denied", "You are not authorized to cancel this booking.");
  }

  // Check if booking is already cancelled
  if (booking.status !== 'confirmed') {
    throw new HttpsError("failed-precondition", `Booking is already in '${booking.status}' state and cannot be cancelled.`);
  }

  const { libraryId, seatId, startDate, endDate, startMinutes, endMinutes } = booking;
  const timeKey = `${startMinutes}_${endMinutes}`;

  // 4. De-allocate in RTDB for all dates
  const rtdbUpdates: { [path: string]: any } = {};
  const dates: string[] = [];
  let cur = new Date(startDate);
  const end = new Date(endDate);
  while (cur <= end) {
      dates.push(cur.toISOString().split('T')[0]);
      cur.setDate(cur.getDate() + 1);
  }

  dates.forEach(date => {
      // Set value to null to delete the key
      rtdbUpdates[`availability/${libraryId}/${date}/${seatId}/${timeKey}`] = null;
  });

  await rtdb.ref().update(rtdbUpdates);

  // 5. Update the booking status in Firestore
  await bookingRef.update({
    status: 'cancelled',
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, message: "Booking cancelled successfully." };
});
