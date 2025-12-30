import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { IManagerApproveSeatData } from "../types/booking";
import { DEPLOYMENT_REGION } from "../config";

if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();
const rtdb = admin.database();

/**
 * @function managerApproveSeat
 * @description HTTPS Callable function to approve a student application and allocate a seat (manually or automatically).
 * This creates booking records for the duration of the plan and updates the application status.
 */
export const managerApproveSeat = onCall<IManagerApproveSeatData, Promise<{ success: boolean; message: string }>>(
  { region: DEPLOYMENT_REGION },
  async (request) => {
    // 1. Validate authentication
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated.");
    }
    const { applicationId, seatId, autoAllot } = request.data;

    // 2. Fetch Application
    const appRef = db.collection("studentLibraryApplications").doc(applicationId);
    const appSnap = await appRef.get();
    if (!appSnap.exists) {
      throw new HttpsError("not-found", "Application not found.");
    }
    const appData = appSnap.data();
    if (!appData) {
      throw new HttpsError("not-found", "Application data is empty.");
    }

    if (appData.applicationStatus === "approved") {
      throw new HttpsError("failed-precondition", "Application is already approved.");
    }

    const libraryId = appData.libraryId;
    const selectedPlan = appData.selectedPlan;

    if (!selectedPlan) {
      throw new HttpsError("failed-precondition", "Application has no selected plan details.");
    }

    // Extract plan details. 
    // We expect startDate/endDate to be strings (YYYY-MM-DD) or Timestamps.
    let startDate = selectedPlan.startDate;
    let endDate = selectedPlan.endDate;
    const slotTypeId = selectedPlan.slotTypeId;

    // Handle Timestamp conversion if necessary
    if (typeof startDate === 'object' && startDate.toDate) startDate = startDate.toDate().toISOString().split('T')[0];
    if (typeof endDate === 'object' && endDate.toDate) endDate = endDate.toDate().toISOString().split('T')[0];

    if (!startDate || !endDate || !slotTypeId) {
      throw new HttpsError("failed-precondition", "Plan is missing startDate, endDate, or slotTypeId.");
    }

    // 3. Fetch Seat Config
    // We need seat details to confirm existence and getting seatNumber
    const seatsRef = db.collection("libraries").doc(libraryId).collection("seats");
    const seatsSnap = await seatsRef.get();
    
    if (seatsSnap.empty) {
      throw new HttpsError("failed-precondition", "Library has no seats configured.");
    }

    const allSeats = seatsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));
    const activeSeats = allSeats.filter(s => s.status === 'active');

    if (activeSeats.length === 0) {
      throw new HttpsError("failed-precondition", "No active seats available in this library.");
    }

    // 4. Determine Target Seat
    let targetSeat: any = null;

    // Generate all dates first
    const dates: string[] = [];
    let cur = new Date(startDate);
    const end = new Date(endDate);
    while (cur <= end) {
      dates.push(cur.toISOString().split('T')[0]);
      cur.setDate(cur.getDate() + 1);
    }

    if (seatId) {
      targetSeat = activeSeats.find(s => s.id === seatId);
      if (!targetSeat) {
        throw new HttpsError("not-found", `Seat ${seatId} not found or not active.`);
      }
      // Check availability for this specific seat across all dates
      const availabilityPromises = dates.map(d => 
        rtdb.ref(`availability/${libraryId}/${d}/${slotTypeId}/seats/${targetSeat.id}`).once('value')
      );
      const snapshots = await Promise.all(availabilityPromises);
      const conflictIndex = snapshots.findIndex(s => s.exists());
      if (conflictIndex !== -1) {
        throw new HttpsError("unavailable", `Seat ${targetSeat.seatNumber} is already booked on ${dates[conflictIndex]}.`);
      }

    } else if (autoAllot) {
      // Logic: Find a seat that is free on ALL dates.
      // We need to fetch availability for all dates in the range.
      // Optimization: Fetch availability for all dates for this library/slotType.
      
      const availabilityPromises = dates.map(d => 
        rtdb.ref(`availability/${libraryId}/${d}/${slotTypeId}/seats`).once('value')
      );
      const snapshots = await Promise.all(availabilityPromises);
      
      // Calculate booked seat IDs for each date
      const bookedMap: Record<string, Set<string>> = {}; // seatId -> Set of dates it is booked
      
      snapshots.forEach((snap, idx) => {
        const date = dates[idx];
        const val = snap.val();
        if (val) {
          Object.keys(val).forEach(sId => {
            if (!bookedMap[sId]) bookedMap[sId] = new Set();
            bookedMap[sId].add(date);
          });
        }
      });

      // Find a seat from activeSeats that is NOT in bookedMap for ANY of the requested dates
      // Actually, we just need a seat where for all dates d in dates, seatId is not in bookedMap[seatId] (if we flipped map)
      // Simpler: iterate active seats, check if free on all dates.
      
      targetSeat = activeSeats.find(seat => {
        const bookedDates = bookedMap[seat.id];
        if (!bookedDates) return true; // Seat never booked
        // Check if any of our requested dates are in the booked set
        // Since we iterated dates to build the map, if the seat is in the map, it means it's booked on *some* date.
        // But wait, the map contains bookings for *this slotType*.
        // So we just need to check if any of our 'dates' overlap with 'bookedDates'.
        // My map construction: iterating 'dates'. So if seatId is in bookedMap, it means it is booked on at least one of 'dates'.
        // So, if seatId is in bookedMap, it is invalid for this full-duration booking.
        return false;
      });

      if (!targetSeat) {
        throw new HttpsError("unavailable", "No single seat is available for the entire duration. Please try manual allocation or split bookings.");
      }
    } else {
      throw new HttpsError("invalid-argument", "Either seatId must be provided or autoAllot set to true.");
    }

    // 5. Execute Updates (RTDB + Firestore)
    const updates: any = {};
    const batch = db.batch();
    
    dates.forEach(date => {
      const bookingRef = db.collection("bookings").doc();
      const bId = bookingRef.id;

      // RTDB: Map seatId -> bookingId
      updates[`availability/${libraryId}/${date}/${slotTypeId}/seats/${targetSeat.id}`] = bId;
      updates[`availability/${libraryId}/${date}/${slotTypeId}/totalBooked`] = admin.database.ServerValue.increment(1);

      // Firestore: Create Booking
      batch.set(bookingRef, {
        id: bId,
        userId: appData.studentId || appData.studentEmail, // fallback
        libraryId,
        seatId: targetSeat.id,
        slotTypeId,
        bookingDate: date,
        status: 'confirmed',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        sourceApplicationId: applicationId,
        seatNumber: targetSeat.seatNumber // Useful for quick reference
      });
    });

    // Update Application Doc
    batch.update(appRef, {
      applicationStatus: 'approved',
      allocatedSeat: {
        id: targetSeat.id,
        seatNumber: targetSeat.seatNumber
      },
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Commit
    await rtdb.ref().update(updates);
    await batch.commit();

    return { success: true, message: `Application approved and seat ${targetSeat.seatNumber} allocated.` };
  }
);
