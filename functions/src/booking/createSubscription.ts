import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { IBooking, ISeat, ICreateSubscriptionData } from "../types/booking";
import { DEPLOYMENT_REGION } from "../config";

if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();
const rtdb = admin.database();

/**
 * @function createSubscription
 * @description HTTPS Callable function to create a batch of bookings for a subscription period.
 *
 * @param request - The request object from the client.
 * @param request.data.libraryId
 * @param request.data.seatRequirements
 * @param request.data.subscriptionDetails - { startDate, endDate, slotTypeId }
 * @param request.auth - The authentication information of the user.
 *
 * @returns {Promise<{success: boolean, bookingIds: string[]}>}
 * @throws {HttpsError} - Throws on validation, auth, or availability errors.
 */
export const createSubscription = onCall<ICreateSubscriptionData, Promise<{success: boolean, bookingIds: string[]}>>(
    { region: DEPLOYMENT_REGION },
    async (request) => {
    // 1. Validation
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated.");
    }
    const userId = request.auth.uid;
    const { libraryId, seatRequirements, subscriptionDetails } = request.data;
    const { startDate, endDate, slotTypeId } = subscriptionDetails;

    // 2. Generate Date List
    const dates: string[] = [];
    let currentDate = new Date(startDate);
    const lastDate = new Date(endDate);
    while (currentDate <= lastDate) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // 3. Pre-flight Availability Check
    const seatsSnapshot = await db.collection("libraries").doc(libraryId).collection("seats").get();
    const eligibleSeats = seatsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as ISeat))
        .filter(seat => seat.isAC === seatRequirements.isAC && seat.status === 'active');
    
    if (eligibleSeats.length === 0) {
        throw new HttpsError("not-found", "No seats match the specified requirements.");
    }

    const availabilityPromises = dates.map(date => rtdb.ref(`availability/${libraryId}/${date}/${slotTypeId}`).get());
    const availabilitySnapshots = await Promise.all(availabilityPromises);

    for (let i = 0; i < dates.length; i++) {
        const snap = availabilitySnapshots[i];
        const totalBooked = snap.exists() ? snap.val().totalBooked : 0;
        if (totalBooked >= eligibleSeats.length) {
            throw new HttpsError("failed-precondition", `Slot is full on ${dates[i]}. Cannot create subscription.`);
        }
    }

    // 4. Firestore Batch Write
    const batch = db.batch();
    const bookingIds: string[] = [];
    const rtdbUpdates: { [path: string]: any } = {};

    for (const date of dates) {
        const bookingRef = db.collection("bookings").doc();
        bookingIds.push(bookingRef.id);

        // This is a simplified allocation. A robust version would re-check seat IDs for each date.
        // For v1, we rely on the total count and don't assign a specific seat ID in this function.
        const newBooking: Omit<IBooking, 'id' | 'seatId'> = {
            userId,
            libraryId,
            slotTypeId,
            bookingDate: date,
            status: 'confirmed',
            createdAt: admin.firestore.FieldValue.serverTimestamp() as FirebaseFirestore.Timestamp,
            updatedAt: admin.firestore.FieldValue.serverTimestamp() as FirebaseFirestore.Timestamp,
        };
        batch.set(bookingRef, newBooking, { merge: true }); // Using merge to be safe
        
        // Prepare RTDB updates
        const rtdbPath = `availability/${libraryId}/${date}/${slotTypeId}/totalBooked`;
        rtdbUpdates[rtdbPath] = admin.database.ServerValue.increment(1);
    }

    // 5. Commit changes
    await batch.commit();
    await rtdb.ref().update(rtdbUpdates);

    return { success: true, bookingIds: bookingIds };
});
