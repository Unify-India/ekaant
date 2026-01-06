import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { IManagerApproveSeatData, ISeat, IPricingPlan } from "../types/booking";
import { DEPLOYMENT_REGION } from "../config";
import { timeToMinutes, isOverlap } from "../utils/time";

if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();
const rtdb = admin.database();

/**
 * @function managerApproveSeat
 * @description HTTPS Callable function to approve a student application and allocate a seat (manually or automatically).
 * This creates booking records for the duration of the plan and updates the application status.
 * Refactored to use minute-based time ranges for collision detection.
 */
export const managerApproveSeat = onCall<IManagerApproveSeatData, Promise<{ success: boolean; message: string }>>(
  { region: DEPLOYMENT_REGION },
  async (request) => {
    // 1. Validate authentication
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "User must be authenticated.");
    }
    const { applicationId, seatId, autoAllot, startDate: reqStartDate, endDate: reqEndDate, paymentAmount } = request.data;

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
    const selectedPlan = appData.selectedPlan as IPricingPlan;

    if (!selectedPlan) {
      throw new HttpsError("failed-precondition", "Application has no selected plan details.");
    }

    // Extract plan details. 
    let startDate = reqStartDate || selectedPlan.startDate;
    let endDate = reqEndDate || selectedPlan.endDate;

    // Handle Timestamp conversion if necessary
    if (typeof startDate === 'object' && (startDate as any).toDate) startDate = (startDate as any).toDate().toISOString().split('T')[0];
    if (typeof endDate === 'object' && (endDate as any).toDate) endDate = (endDate as any).toDate().toISOString().split('T')[0];

    if (!startDate || !endDate) {
      throw new HttpsError("failed-precondition", "Plan is missing startDate or endDate.");
    }

    // Determine Time Range in Minutes
    let startMinutes: number;
    let endMinutes: number;

    // We prefer the plan's specific start/end times.
    // Ensure the plan has valid time strings (e.g., "06:00").
    if (selectedPlan.startTime && selectedPlan.endTime) {
      startMinutes = timeToMinutes(selectedPlan.startTime);
      endMinutes = timeToMinutes(selectedPlan.endTime);
    } else {
        // Fallback parsing from timeSlot string if necessary, e.g. "06:00 - 10:00"
        // But for now, we enforce strict structure.
        throw new HttpsError("failed-precondition", "Plan must have valid startTime and endTime (e.g. '06:00').");
    }

    if (isNaN(startMinutes) || isNaN(endMinutes)) {
        throw new HttpsError("failed-precondition", "Invalid time format in plan.");
    }

    // 3. Fetch Seat Config
    const libraryRef = db.collection("libraries").doc(libraryId);
    const librarySnap = await libraryRef.get();
    
    if (!librarySnap.exists) {
      throw new HttpsError("not-found", "Library not found.");
    }

    const libraryData = librarySnap.data();
    if (!libraryData?.seatManagement) {
       throw new HttpsError("failed-precondition", "Library configuration error: No seat management data.");
    }

    const allSeats: ISeat[] = libraryData.seatManagement.seats || [];
    if (allSeats.length === 0) {
      throw new HttpsError("failed-precondition", "Library has no seats configured.");
    }

    const activeSeats = allSeats.filter((s: ISeat) => s.status === 'active');
    if (activeSeats.length === 0) {
      throw new HttpsError("failed-precondition", "No active seats available in this library.");
    }

    // 4. Determine Target Seat
    let targetSeat: ISeat | undefined | null = null;

    // Generate all dates first
    const dates: string[] = [];
    let cur = new Date(startDate);
    const end = new Date(endDate);
    while (cur <= end) {
      dates.push(cur.toISOString().split('T')[0]);
      cur.setDate(cur.getDate() + 1);
    }

    if (seatId) {
      // MANUAL ALLOCATION
      targetSeat = activeSeats.find((s: ISeat) => s.id === seatId);
      if (!targetSeat) {
        throw new HttpsError("not-found", `Seat ${seatId} not found or not active.`);
      }

      // Check availability for this specific seat across all dates
      // RTDB Path: availability/{libraryId}/{date}/{seatId} -> { "start_end": "bookingId" }
      for (const date of dates) {
          const seatRef = rtdb.ref(`availability/${libraryId}/${date}/${targetSeat.id}`);
          const snapshot = await seatRef.once('value');
          
          if (snapshot.exists()) {
              const bookings = snapshot.val();
              for (const key of Object.keys(bookings)) {
                  const [existStart, existEnd] = key.split('_').map(Number);
                  if (isOverlap(startMinutes, endMinutes, existStart, existEnd)) {
                       throw new HttpsError("unavailable", `Seat ${targetSeat.seatNumber} is already booked on ${date} (Overlap: ${key}).`);
                  }
              }
          }
      }

    } else if (autoAllot) {
      // AUTO ALLOCATION
      // Find a seat that is free on ALL dates for the given time range.
      
      for (const seat of activeSeats) {
        let isSeatFree = true;

        for (const date of dates) {
            const seatRef = rtdb.ref(`availability/${libraryId}/${date}/${seat.id}`);
            const snapshot = await seatRef.once('value');

            if (snapshot.exists()) {
                const bookings = snapshot.val();
                for (const key of Object.keys(bookings)) {
                    const [existStart, existEnd] = key.split('_').map(Number);
                    if (isOverlap(startMinutes, endMinutes, existStart, existEnd)) {
                        isSeatFree = false;
                        break;
                    }
                }
            }
            if (!isSeatFree) break; // Optimization: stop checking dates for this seat
        }

        if (isSeatFree) {
            targetSeat = seat;
            break; // Found a valid seat!
        }
      }

      if (!targetSeat) {
        throw new HttpsError("unavailable", "No single seat is available for the entire duration. Please try manual allocation or split bookings.");
      }

    } else {
      throw new HttpsError("invalid-argument", "Either seatId must be provided or autoAllot set to true.");
    }

    // 5. Execute Updates (RTDB + Firestore)
    const updates: any = {};
    const batch = db.batch();
    const timeKey = `${startMinutes}_${endMinutes}`;
    
    // Generate ONE Booking ID
    const bookingRef = db.collection("bookings").doc();
    const bookingId = bookingRef.id;

    // RTDB: Loop through dates to block availability with the SAME bookingId
    dates.forEach(date => {
      updates[`availability/${libraryId}/${date}/${targetSeat!.id}/${timeKey}`] = bookingId;
    });

    // Firestore: Create ONE Booking Record
    batch.set(bookingRef, {
      id: bookingId,
      userId: appData.studentId || appData.studentEmail,
      libraryId,
      seatId: targetSeat!.id,
      startDate: startDate,
      endDate: endDate,
      status: 'confirmed',
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      sourceApplicationId: applicationId,
      seatNumber: targetSeat!.seatNumber,
      startMinutes: startMinutes,
      endMinutes: endMinutes,
      planName: selectedPlan.planName // ADDED
    });

    // Create Payment Record if amount > 0
    if (paymentAmount && paymentAmount > 0) {
      const paymentRef = db.collection("payments").doc();
      batch.set(paymentRef, {
        id: paymentRef.id,
        userId: appData.studentId || appData.studentEmail,
        libraryId: libraryId,
        amount: paymentAmount,
        date: FieldValue.serverTimestamp(),
        status: 'paid',
        type: 'subscription',
        planName: selectedPlan.planName,
        applicationId: applicationId,
        description: `Payment for ${selectedPlan.planName} (Application: ${applicationId})`,
        startDate,
        endDate
      });
    }

    // Update Application Doc
    const updatedPlan = { ...selectedPlan, startDate, endDate };

    batch.update(appRef, {
      applicationStatus: 'approved',
      allocatedSeat: {
        id: targetSeat!.id,
        seatNumber: targetSeat!.seatNumber
      },
      selectedPlan: updatedPlan,
      updatedAt: FieldValue.serverTimestamp()
    });

    // Commit
    await rtdb.ref().update(updates);
    await batch.commit();

    return { success: true, message: `Application approved and seat ${targetSeat!.seatNumber} allocated.` };
  }
);
