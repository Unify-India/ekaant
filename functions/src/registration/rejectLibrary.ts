import {onCall, HttpsError} from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import {db} from '../lib/firebaseAdmin';
import {ApplicationStatus, UserRole} from '../types/enums';
import type {LibraryRegistrationRequest} from '../types';

/**
 * Rejects a library registration request.
 *
 * This callable function is for admin use only. It updates the status of a
 * request to 'rejected' and saves the reason.
 *
 * @param {functions.https.CallableRequest} request - The request object from
 *   the callable function.
 * @returns {Promise<{success: boolean, message: string}>} An object with a
 *   success message.
 * @throws {HttpsError} - `unauthenticated` if the user is not logged in.
 * @throws {HttpsError} - `permission-denied` if the user is not an admin.
 * @throws {HttpsError} - `invalid-argument` if the payload is missing or
 *   invalid.
 * @throws {HttpsError} - `not-found` if the registration request does not
 *   exist.
 * @throws {HttpsError} - `failed-precondition` if the request is not in a
 *   'pending' state.
 */
export const rejectLibrary = onCall(async (request) => {
  // 1. Validate the admin's authentication
  if (!request.auth) {
    throw new HttpsError('unauthenticated',
      'The function must be called while authenticated.');
  }
  if (request.auth.token.role !== UserRole.Admin) {
    throw new HttpsError('permission-denied',
      'Only admins can reject library requests.');
  }

  // 2. Validate the request payload
  const {registrationRequestId, adminComments} = request.data as {
    registrationRequestId: string,
    adminComments: string
  };
  if (!registrationRequestId || typeof registrationRequestId !== 'string') {
    throw new HttpsError('invalid-argument',
      'The function must be called with a valid "registrationRequestId".');
  }
  if (!adminComments || typeof adminComments !== 'string' ||
      adminComments.length < 10) {
    throw new HttpsError('invalid-argument',
      'The "adminComments" must be a string of at least 10 characters.');
  }

  const requestRef = db.collection('libraryRegistrationRequests')
    .doc(registrationRequestId);

  try {
    await db.runTransaction(async (transaction) => {
      const requestDoc = await transaction.get(requestRef);
      if (!requestDoc.exists) {
        throw new HttpsError('not-found',
          `Registration request with ID ${registrationRequestId} not found.`);
      }

      const registrationRequest = requestDoc.data() as
        LibraryRegistrationRequest;

      // Idempotency check
      if (registrationRequest.status !== ApplicationStatus.Pending) {
        throw new HttpsError('failed-precondition',
          `Request is already in '${registrationRequest.status}' status.`);
      }

      // Update the request status and comments
      transaction.update(requestRef, {
        status: ApplicationStatus.Rejected,
        adminComments: adminComments,
        updatedAt: new Date(),
      });
    });

    return {success: true, message: `Library request ${registrationRequestId}` +
      ' rejected.'};
  } catch (error) {
    logger.error('Error rejecting library:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal',
      'An unexpected error occurred while rejecting the library.');
  }
});
