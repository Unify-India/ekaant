import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {
  ISeat,
  IPricingPlan,
  IAvailableSlotInfo,
  IGetAvailableSlotsData,
} from "../types/booking";
import { DEPLOYMENT_REGION } from "../config";
import { timeToMinutes, isOverlap } from "../utils/time";

if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();
const rtdb = admin.database();

/**
 * @function getAvailableSlots
 * @description HTTPS Callable function to get available slots (plans) for a given date.
 * Refactored to use dynamic pricingPlans and minute-based availability.
 */
export const getAvailableSlots = onCall<IGetAvailableSlotsData, Promise<IAvailableSlotInfo[]>>(
  { region: DEPLOYMENT_REGION },
  async (request) => {
    const { libraryId, date, seatRequirements } = request.data;

    try {
      // 1. Fetch library doc (for pricingPlans) and seats subcollection
      const libraryRef = db.collection("libraries").doc(libraryId);
      const [librarySnap, seatsSnapshot] = await Promise.all([
        libraryRef.get(),
        libraryRef.collection("seats").get()
      ]);

      if (!librarySnap.exists) {
        throw new HttpsError("not-found", "Library not found.");
      }
      
      const libraryData = librarySnap.data();
      const pricingPlans: IPricingPlan[] = libraryData?.pricingPlans || [];

      if (pricingPlans.length === 0) {
         // Fallback: Check if there are legacy slotTypes? 
         // For now, assuming migration to pricingPlans is key.
         // If no plans, return empty.
         return [];
      }

      if (seatsSnapshot.empty) {
        throw new HttpsError("not-found", "No seats configured.");
      }

      const allSeats = seatsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ISeat));

      // 2. Filter Eligible Seats
      const eligibleSeats = allSeats.filter(seat => seat.isAC === seatRequirements.isAC && seat.status === 'active');
      const eligibleSeatCount = eligibleSeats.length;

      if (eligibleSeatCount === 0) {
        return []; 
      }

      // 3. Fetch Live Availability (Date level)
      // Path: availability/{libraryId}/{date}/{seatId}/{start_end}
      const availabilityRef = rtdb.ref(`availability/${libraryId}/${date}`);
      const availabilitySnapshot = await availabilityRef.once("value");
      const availabilityData = availabilitySnapshot.val() || {}; // { seatId: { "s_e": bookingId, ... } }

      // 4. Calculate Availability for each Plan
      const availableSlots: IAvailableSlotInfo[] = [];

      for (const plan of pricingPlans) {
          // Skip plans without valid time
          if (!plan.startTime || !plan.endTime) continue;

          const startMinutes = timeToMinutes(plan.startTime);
          const endMinutes = timeToMinutes(plan.endTime);
          if (isNaN(startMinutes) || isNaN(endMinutes)) continue;

          let seatsAvailable = 0;

          // Check every eligible seat for this plan's time range
          for (const seat of eligibleSeats) {
              const seatBookings = availabilityData[seat.id] || {};
              let isFree = true;

              for (const key of Object.keys(seatBookings)) {
                  const [existStart, existEnd] = key.split('_').map(Number);
                  if (isOverlap(startMinutes, endMinutes, existStart, existEnd)) {
                      isFree = false;
                      break;
                  }
              }

              if (isFree) {
                  seatsAvailable++;
              }
          }

          if (seatsAvailable > 0) {
              // Map IPricingPlan to IAvailableSlotInfo
              // IAvailableSlotInfo extends ISlotType (id, startTime, endTime, durationType, isPeak)
              // We map plan fields to these.
              
              availableSlots.push({
                  id: plan.planName, // Use name as ID if no ID
                  startTime: plan.startTime,
                  endTime: plan.endTime,
                  durationType: '4h', // Placeholder or derive from planType
                  isPeak: false,      // Placeholder
                  price: plan.rate,
                  seatsAvailable: seatsAvailable
              });
          }
      }

      return availableSlots;

    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }
      console.error(`Error fetching available slots for library ${libraryId} on ${date}:`, error);
      throw new HttpsError(
        "internal", "An unexpected error occurred."
      );
    }
  }
);
