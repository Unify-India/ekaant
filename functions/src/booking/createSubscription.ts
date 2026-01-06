import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { IBooking, ISeat, ICreateSubscriptionData } from "../types/booking";
import { DEPLOYMENT_REGION } from "../config";
import { timeToMinutes, isOverlap } from "../utils/time";

if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();
const rtdb = admin.database();

export const createSubscription = onCall<ICreateSubscriptionData, Promise<{success: boolean, bookingIds: string[]}>>(
    { region: DEPLOYMENT_REGION },
    async (request) => {
    // 1. Validation
    if (!request.auth) {
        throw new HttpsError("unauthenticated", "User must be authenticated.");
    }
    const userId = request.auth.uid;
    const { libraryId, seatRequirements, subscriptionDetails } = request.data;
    const { startDate, endDate, startTime, endTime, slotTypeId } = subscriptionDetails;

    if (!startTime || !endTime) {
        throw new HttpsError("invalid-argument", "startTime and endTime are required.");
    }

    const startMinutes = timeToMinutes(startTime);
    const endMinutes = timeToMinutes(endTime);
    if (isNaN(startMinutes) || isNaN(endMinutes)) {
        throw new HttpsError("invalid-argument", "Invalid time format (HH:MM expected).");
    }

    // 2. Fetch Config & Filter Eligible Seats
    const libraryRef = db.collection("libraries").doc(libraryId);
    const seatsSnapshot = await libraryRef.collection("seats").get();

    if (seatsSnapshot.empty) {
        throw new HttpsError("not-found", "Library has no seats.");
    }

    const eligibleSeats = seatsSnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as ISeat))
        .filter(seat => seat.isAC === seatRequirements.isAC && seat.status === 'active');
    
    if (eligibleSeats.length === 0) {
        throw new HttpsError("not-found", "No seats match the specified requirements.");
    }

    // 3. Generate Date List
    const dates: string[] = [];
    let currentDate = new Date(startDate);
    const lastDate = new Date(endDate);
    while (currentDate <= lastDate) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }

    // 4. Allocation Logic (Find ONE seat for ALL dates)
    // We enforce a single seat for the entire subscription period as per new architecture.
    
    const rtdbUpdates: { [path: string]: any } = {};
    const batch = db.batch();
    const timeKey = `${startMinutes}_${endMinutes}`;

    // Helper to check seat availability for a date
    const checkSeat = async (date: string, seatId: string): Promise<boolean> => {
        const snap = await rtdb.ref(`availability/${libraryId}/${date}/${seatId}`).once('value');
        if (!snap.exists()) return true;
        const bookings = snap.val();
        for (const key of Object.keys(bookings)) {
            const [s, e] = key.split('_').map(Number);
            if (isOverlap(startMinutes, endMinutes, s, e)) return false;
        }
        return true;
    };

    let commonSeat: ISeat | null = null;
    for (const seat of eligibleSeats) {
        const checks = await Promise.all(dates.map(d => checkSeat(d, seat.id)));
        if (checks.every(r => r)) {
            commonSeat = seat;
            break;
        }
    }

    if (!commonSeat) {
         throw new HttpsError("unavailable", `No single seat available for the entire duration (${startDate} to ${endDate}). Subscription requires a consistent seat.`);
    }

    // 5. Prepare Writes
    const bookingRef = db.collection("bookings").doc();
    const bookingId = bookingRef.id;

    // RTDB: Block dates
    dates.forEach(date => {
        rtdbUpdates[`availability/${libraryId}/${date}/${commonSeat!.id}/${timeKey}`] = bookingId;
    });

    // Firestore: One Booking
    const newBooking: IBooking = {
        id: bookingId,
        userId,
        libraryId,
        seatId: commonSeat.id,
        slotTypeId, // Optional
        startDate,
        endDate,
        status: 'confirmed',
        createdAt: FieldValue.serverTimestamp() as FirebaseFirestore.Timestamp,
        updatedAt: FieldValue.serverTimestamp() as FirebaseFirestore.Timestamp,
        startMinutes,
        endMinutes,
        seatNumber: commonSeat.seatNumber,
        planName: subscriptionDetails.planName || 'Standard'
    };
    batch.set(bookingRef, newBooking);

    // 6. Commit
    await rtdb.ref().update(rtdbUpdates);
    await batch.commit();

    return { success: true, bookingIds: [bookingId] };
});
