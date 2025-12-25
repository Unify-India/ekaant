import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {
  ISeat,
  ISlotType,
  IPricing,
  IAvailabilitySlot,
  IAvailableSlotInfo,
  IGetAvailableSlotsData,
} from "../types/booking";
import { DEPLOYMENT_REGION } from "../config";

if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();
const rtdb = admin.database();

/**
 * @function getAvailableSlots
 * @description HTTPS Callable function to get available slots for a given date and seat requirement.
 *
 * @param request - The request object from the client.
 * @param request.data.libraryId - The ID of the library.
 * @param request.data.date - The date for which to check availability (YYYY-MM-DD).
 * @param request.data.seatRequirements - The requirements for the seat (e.g., { isAC: true }).
 *
 * @returns {Promise<IAvailableSlotInfo[]>} - A promise that resolves with an array of available slots, including price and count.
 * @throws {HttpsError} - Throws an error for invalid arguments or if data is not found.
 */
export const getAvailableSlots = onCall<IGetAvailableSlotsData, Promise<IAvailableSlotInfo[]>>(
  { region: DEPLOYMENT_REGION },
  async (request) => {
    const { libraryId, date, seatRequirements } = request.data;

    try {
      // 2. Fetch all required config from Firestore in parallel
      const [seatsSnapshot, slotTypesSnapshot, pricingSnapshot] =
        await Promise.all([
          db.collection("libraries").doc(libraryId).collection("seats").get(),
          db.collection("libraries").doc(libraryId).collection("slotTypes").get(),
          db.collection("libraries").doc(libraryId).collection("pricing").get(),
        ]);

      if (seatsSnapshot.empty || slotTypesSnapshot.empty || pricingSnapshot.empty) {
        throw new HttpsError(
          "not-found", `Configuration not found for library ${libraryId}.`
        );
      }

      const allSeats = seatsSnapshot.docs.map(doc => doc.data() as ISeat);
      const allSlotTypes = slotTypesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ISlotType));
      const allPricing = pricingSnapshot.docs.map(doc => doc.data() as IPricing);

      // 3. Filter seats based on requirements to get eligible seat count
      const seatCategory = seatRequirements.isAC ? "AC" : "NON_AC";
      const eligibleSeats = allSeats.filter(seat => seat.isAC === seatRequirements.isAC && seat.status === 'active');
      const eligibleSeatCount = eligibleSeats.length;

      if (eligibleSeatCount === 0) {
        return []; // No seats match the criteria, so no slots can be available.
      }

      // 4. Fetch live availability from Realtime Database
      const availabilityRef = rtdb.ref(`availability/${libraryId}/${date}`);
      const availabilitySnapshot = await availabilityRef.once("value");
      const availabilityData: { [slotId: string]: IAvailabilitySlot } = availabilitySnapshot.val() || {};

      // 5. Determine available slots
      const availableSlots: IAvailableSlotInfo[] = [];

      for (const slotType of allSlotTypes) {
        const slotAvailability = availabilityData[slotType.id] || { totalBooked: 0 };
        const totalBooked = slotAvailability.totalBooked;
        const seatsAvailable = eligibleSeatCount - totalBooked;

        if (seatsAvailable > 0) {
          // Find the corresponding price
          const priceRule = allPricing.find(
            (p) =>
              p.durationType === slotType.durationType &&
              p.seatCategory === seatCategory
          );

          if (priceRule) {
            availableSlots.push({
              ...slotType,
              price: priceRule.basePrice,
              seatsAvailable: seatsAvailable,
            });
          }
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
