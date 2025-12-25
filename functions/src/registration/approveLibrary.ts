import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db, auth } from '../lib/firebaseAdmin';
import { DEPLOYMENT_REGION } from '../config';

/**
 * Handles the approval of a library registration request.
 *
 * This callable function performs the following actions:
 * 1. Verifies that the request is made by an authenticated admin user.
 * 2. Reads the library registration request from Firestore.
 * 3. Creates a new Firebase Authentication user for the library manager.
 * 4. Sets custom claims (`role: 'manager'`, `libraryId`) for the new manager user.
 * 5. Creates a new public document for the library in the `libraries` collection.
 * 6. Updates the original registration request's status to 'approved'.
 *
 * @param {functions.https.CallableRequest} request - The request object from the callable function.
 */
export const approveLibrary = onCall({ region: DEPLOYMENT_REGION }, async (request) => {
  // 1. Authentication & Authorization Check
  if (!request.auth || request.auth.token.role !== 'admin') {
    throw new HttpsError('permission-denied', 'This function must be called by an admin.');
  }

  const { registrationId } = request.data as { registrationId: string };
  if (!registrationId) {
    throw new HttpsError('invalid-argument', 'The function must be called with a "registrationId".');
  }

  const registrationRequestRef = db.collection('library-registrations').doc(registrationId);

  try {
    const registrationDoc = await registrationRequestRef.get();
    if (!registrationDoc.exists) {
      throw new HttpsError('not-found', `Registration request with ID ${registrationId} not found.`);
    }

    const registrationData = registrationDoc.data()!;

    // Prevent re-approval
    if (registrationData.applicationStatus === 'approved') {
      throw new HttpsError('failed-precondition', 'This library has already been approved.');
    }

    // 2. Create Library Manager Auth User
    // The UI schema uses hostProfile for manager details
    const hostProfile = registrationData.hostProfile || {};
    const managerEmail = hostProfile.email;
    const managerName = hostProfile.fullName;

    if (!managerEmail) {
      throw new HttpsError('failed-precondition', 'Manager email is missing in the registration request.');
    }

    const managerPassword = Math.random().toString(36).slice(-8); // Generate a random temporary password

    let managerUserRecord;
    try {
      // Try to find if user already exists
      managerUserRecord = await auth.getUserByEmail(managerEmail);
      logger.info(`User already exists for email ${managerEmail}. Updating claims.`);
    } catch (e: any) {
      if (e.code === 'auth/user-not-found') {
        // Create new user
        managerUserRecord = await auth.createUser({
          email: managerEmail,
          password: managerPassword,
          displayName: managerName,
        });
      } else {
        throw e;
      }
    }

    // 3. Set Custom Claims
    const libraryId = registrationId; // Use the registration ID as the new library ID
    await auth.setCustomUserClaims(managerUserRecord.uid, {
      role: 'manager',
      libraryId: libraryId,
    });

    // 4. Create Public `libraries` Document
    const libraryRef = db.collection('libraries').doc(libraryId);
    
    // Mapping from registrationData to library schema
    const basicInfo = registrationData.basicInformation || {};
    const seatManagement = registrationData.seatManagement || {};

    await libraryRef.set({
      name: basicInfo.libraryName || 'Unnamed Library',
      ownerId: managerUserRecord.uid,
      managerIds: [managerUserRecord.uid],
      address: basicInfo.fullAddress || '', // Fallback to fullAddress if parts are missing
      basicInformation: basicInfo,
      hostProfile: hostProfile,
      seatManagement: seatManagement,
      amenities: registrationData.amenities || {},
      bookCollection: registrationData.bookCollection || {},
      pricingPlans: registrationData.pricingPlans || {},
      status: 'approved',
      createdAt: new Date(),
      // Initialize ratings
      rating: {
        average: 0,
        totalReviews: 0
      },
      occupiedSeats: 0,
      totalSeats: seatManagement.totalSeats || 0
    });

    // 5. Delete Original Request
    await registrationRequestRef.delete();

    // TODO: 6. Send Welcome Email
    logger.info(
      `Successfully approved library ${libraryId}. Manager: ${managerEmail}, Temp Password: ${managerPassword}`,
    );

    return {
      status: 'success',
      message: `Library ${basicInfo.libraryName || ''} approved successfully.`,
      tempPassword: managerPassword, // Sending back for admin's info
    };
  } catch (error) {
    logger.error('Error approving library:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', 'An unexpected error occurred while approving the library.');
  }
});
