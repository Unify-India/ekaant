import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { ILibraryConfig, ISeat, ISlotType, IPricing, IGetLibraryConfigData } from "../types/booking";
import { DEPLOYMENT_REGION } from "../config";

// Initialize admin SDK if not already done
if (admin.apps.length === 0) {
  admin.initializeApp();
}
const db = admin.firestore();

/**
 * @function getLibraryConfig
 * @description HTTPS Callable function to fetch the complete configuration for a library.
 * This includes seats, slot types, and pricing information.
 *
 * @param request - The request object from the client.
 * @param request.data.libraryId - The ID of the library to fetch configuration for.
 *
 * @returns {Promise<ILibraryConfig>} - A promise that resolves with the library configuration.
 * @throws {HttpsError} - Throws an error if libraryId is missing,
 * or if the library or its configuration subcollections do not exist.
 */
export const getLibraryConfig = onCall<IGetLibraryConfigData, Promise<ILibraryConfig>>(
  { region: DEPLOYMENT_REGION },
  async (request) => {
    const { libraryId } = request.data;

    // Validate input
    if (!libraryId) {
      throw new HttpsError(
        "invalid-argument",
        "The function must be called with a 'libraryId'."
      );
    }

    try {
      // Use Promise.all to fetch all configurations in parallel
      const [
        seatsSnapshot,
        slotTypesSnapshot,
        pricingSnapshot,
      ] = await Promise.all([
        db.collection("libraries").doc(libraryId).collection("seats").get(),
        db.collection("libraries").doc(libraryId).collection("slotTypes").get(),
        db.collection("libraries").doc(libraryId).collection("pricing").get(),
      ]);

      // Check if any of the collections are empty
      if (
        seatsSnapshot.empty ||
        slotTypesSnapshot.empty ||
        pricingSnapshot.empty
      ) {
        throw new HttpsError(
          "not-found",
          `Configuration not found for library ${libraryId}. Please ensure seats, slotTypes, and pricing are configured.`
        );
      }

      // Map snapshots to typed arrays
      const seats: ISeat[] = seatsSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as ISeat)
      );
      const slotTypes: ISlotType[] = slotTypesSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as ISlotType)
      );
      const pricing: IPricing[] = pricingSnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as IPricing)
      );

      // Return the combined configuration object
      const libraryConfig: ILibraryConfig = {
        seats,
        slotTypes,
        pricing,
      };

      return libraryConfig;
    } catch (error) {
      if (error instanceof HttpsError) {
        throw error;
      }
      console.error(
        `Error fetching configuration for library ${libraryId}:`,
        error
      );
      throw new HttpsError(
        "internal",
        "An unexpected error occurred while fetching the library configuration."
      );
    }
  }
);
