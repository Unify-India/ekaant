import {onCall, HttpsError} from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import {db, auth} from '../lib/firebaseAdmin';
import {ApplicationStatus, UserRole} from '../types/enums';
import type {Library, LibraryRegistrationRequest} from '../types';

/**
 * Approves a library registration request.
 *
 * This callable function is for admin use only. It performs the following
 * actions in a transaction:
 * 1. Validates the admin's authentication and the request payload.
 * 2. Reads the specified library registration request.
 * 3. Verifies the request is still in 'pending' status (idempotency).
 * 4. Creates a new document in the `libraries` collection.
 * 5. Sets custom claims on the user who submitted the request, granting them
 *    the 'manager' role.
 * 6. Updates the user's role in their `users` document.
 * 7. Updates the original request's status to 'approved'.
 *
 * @param {functions.https.CallableRequest} request - The request object from the
 *   callable function, containing auth and data.
 * @returns {Promise<{success: boolean, message: string}>} An object with a
 *   success message.
 * @throws {functions.https.HttpsError} - `unauthenticated` if the user is
 *   not logged in.
 * @throws {functions.https.HttpsError} - `permission-denied` if the user is
 *   not an admin.
 * @throws {functions.https.HttpsError} - `invalid-argument` if the
 *   `registrationRequestId` is missing or invalid.
 * @throws {functions.https.HttpsError} - `not-found` if the registration
 *   request does not exist.
 * @throws {functions.https.HttpsError} - `failed-precondition` if the request
 *   is not in a 'pending' state.
 */
export const approveLibrary = onCall(async (request) => {
  // 1. Validate the admin's authentication
  if (!request.auth) {
    throw new HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.',
    );
  }
  if (request.auth.token.role !== UserRole.Admin) {
    throw new HttpsError(
      'permission-denied',
      'Only admins can approve library requests.',
    );
  }

  // 2. Validate the request payload
  const {registrationRequestId} = request.data as {
    registrationRequestId: string
  };
  if (!registrationRequestId || typeof registrationRequestId !== 'string') {
    throw new HttpsError(
      'invalid-argument',
      'The function must be called with a valid "registrationRequestId".',
    );
  }

  const requestRef = db.collection('libraryRegistrationRequests')
    .doc(registrationRequestId);

  try {
    await db.runTransaction(async (transaction) => {
      // 3. Read the library registration request
      const requestDoc = await transaction.get(requestRef);
      if (!requestDoc.exists) {
        throw new HttpsError(
          'not-found',
          `Registration request with ID ${registrationRequestId} not found.`,
        );
      }

      const registrationRequest = requestDoc.data() as
        LibraryRegistrationRequest;

      // 4. Verify the request is still in 'pending' status (idempotency check)
      if (registrationRequest.status !== ApplicationStatus.Pending) {
        throw new HttpsError(
          'failed-precondition',
          `Request is already in '${registrationRequest.status}' status ` +
            'and cannot be approved.',
        );
      }

      const userId = registrationRequest.userId;
      const userRef = db.collection('users').doc(userId);
      const userDoc = await transaction.get(userRef);

      if (!userDoc.exists) {
        throw new HttpsError(
          'not-found',
          `User with ID ${userId} who submitted the request does not exist.`,
        );
      }

      // 5. Create a new document in the `libraries` collection
      const newLibraryRef = db.collection('libraries').doc();
      const newLibrary: Omit<Library, 'id' | 'createdAt' | 'updatedAt'> = {
        name: registrationRequest.libraryName,
        ownerId: userId,
        managerIds: [userId],
        location: {
          address: registrationRequest.address,
          city: registrationRequest.city,
          pincode: registrationRequest.pincode,
        },
        seatConfig: {
          totalSeats: registrationRequest.totalSeats,
          slots: [], // Manager can configure this later
        },
        status: 'approved',
      };
      transaction.set(newLibraryRef, {
        ...newLibrary,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // 6. Set custom claims for the manager role
      await auth.setCustomUserClaims(userId, {role: UserRole.Manager});

      // 7. Update the user's role in their `users` document
      transaction.update(userRef, {role: UserRole.Manager});

      // 8. Update the original request's status to 'approved'
      transaction.update(requestRef, {
        status: ApplicationStatus.Approved,
        updatedAt: new Date(),
      });
    });

    return {success: true, message: `Library ${registrationRequestId}` +
      ' approved successfully.'};
  } catch (error) {
    logger.error('Error approving library:', error);
    // Re-throw HTTPS errors or convert others
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError(
      'internal',
      'An unexpected error occurred while approving the library.',
    );
  }
});
