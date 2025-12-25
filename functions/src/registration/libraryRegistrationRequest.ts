import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db } from '../lib/firebaseAdmin';
import { ApplicationStatus } from '../types/enums';
import type { LibraryRegistrationRequest } from '../types';
import { DEPLOYMENT_REGION } from '../config';

/**
 * Submits a new library registration request.
 *
 * This callable function allows any authenticated user to submit an application
 * to have their library listed on the platform. It creates a new document
 * in the `libraryRegistrationRequests` collection for admin review.
 *
 * @param {functions.https.CallableRequest} request - The request object from
 *   the callable function.
 * @returns {Promise<{success: boolean, registrationId: string}>} An object
 *   with the ID of the newly created request.
 * @throws {HttpsError} - `unauthenticated` if the user is not logged in.
 * @throws {HttpsError} - `invalid-argument` if the payload is missing or
 *   invalid.
 */
export const libraryRegistrationRequest = onCall({ region: DEPLOYMENT_REGION }, async (request) => {
  // 1. Validate user authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'You must be logged in to submit a request.');
  }

  // 2. Validate the request payload
  // In a real app, use a library like Zod for robust validation.
  const { libraryName, managerName, managerEmail, managerPhone, address, city, pincode, totalSeats } = request.data as {
    libraryName: string;
    managerName: string;
    managerEmail: string;
    managerPhone: string;
    address: string;
    city: string;
    pincode: string;
    totalSeats: number;
  };
  if (!libraryName || !managerName || !managerEmail || !managerPhone || !address || !city || !pincode || !totalSeats) {
    throw new HttpsError('invalid-argument', 'Missing required fields in the registration request.');
  }
  if (typeof totalSeats !== 'number' || totalSeats <= 0) {
    throw new HttpsError('invalid-argument', '"totalSeats" must be' + ' a positive number.');
  }

  const newRequestRef = db.collection('libraryRegistrationRequests').doc();

  const newRequest: Omit<LibraryRegistrationRequest, 'id' | 'createdAt' | 'updatedAt'> = {
    userId: request.auth.uid,
    libraryName,
    managerName,
    managerEmail,
    managerPhone,
    address,
    city,
    pincode,
    totalSeats,
    status: ApplicationStatus.Pending,
  };

  try {
    await newRequestRef.set({
      ...newRequest,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { success: true, registrationId: newRequestRef.id };
  } catch (error) {
    logger.error('Error submitting library registration request:', error);
    throw new HttpsError('internal', 'An unexpected error occurred while submitting your request.');
  }
});
