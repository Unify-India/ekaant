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

    // 2. Identify/Create Library Manager User
    const ownerId = registrationData.ownerId;
    // The UI schema uses hostProfile for manager details
    const hostProfile = registrationData.hostProfile || {};
    const managerEmail = hostProfile.email;
    const managerName = hostProfile.fullName;

    let managerUserRecord;
    let tempPassword = null;

    // A. Try to find user by ownerId (Preferred)
    if (ownerId) {
      try {
        managerUserRecord = await auth.getUser(ownerId);
        logger.info(`Found existing user by ownerId: ${ownerId}`);
      } catch (e: any) {
        if (e.code !== 'auth/user-not-found') {
          throw e;
        }
        logger.warn(`User with ownerId ${ownerId} not found. Proceeding to email lookup.`);
      }
    }

    // B. Fallback: Find by email or Create new user
    if (!managerUserRecord) {
      if (!managerEmail) {
        throw new HttpsError('failed-precondition', 'Manager email is missing and no valid ownerId found.');
      }

      try {
        // Try to find if user already exists by email
        managerUserRecord = await auth.getUserByEmail(managerEmail);
        logger.info(`Found existing user by email: ${managerEmail}`);
      } catch (e: any) {
        if (e.code === 'auth/user-not-found') {
          // Create new user
          tempPassword = Math.random().toString(36).slice(-8); // Generate a random temporary password
          managerUserRecord = await auth.createUser({
            email: managerEmail,
            password: tempPassword,
            displayName: managerName,
          });
          logger.info(`Created new user for ${managerEmail}`);
        } else {
          throw e;
        }
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

    // Construct the new library document based on the ILibrary interface
    const newLibraryData = {
      // Copy all fields from registrationData, providing defaults
      amenities: registrationData.amenities || [],
      applicationStatus: 'approved',
      basicInformation: registrationData.basicInformation || {},
      bookCollection: registrationData.bookCollection || {},
      codeOfConduct: registrationData.codeOfConduct || '',
      createdAt: registrationData.createdAt || new Date(),
      hostProfile: registrationData.hostProfile || {},
      libraryImages: registrationData.libraryImages || [],
      pricingPlans: registrationData.pricingPlans || [],
      requirements: registrationData.requirements || [],
      seatManagement: registrationData.seatManagement || {},
      totalSeats: registrationData.totalSeats || (registrationData.seatManagement?.seats?.length || 0),

      // Override specific fields
      ownerId: managerUserRecord.uid,
      managerIds: [managerUserRecord.uid],
      updatedAt: new Date(),

      // Initialize library-specific fields
      rating: {
        averageRating: 0,
        totalReviews: 0,
      },
      occupiedSeats: 0,
    };

    await libraryRef.set(newLibraryData);

    // 5. Update Original Request instead of deleting
    await registrationRequestRef.update({
      applicationStatus: 'approved',
      updatedAt: new Date(),
    });

    // TODO: 6. Send Welcome Email
    logger.info(
      `Successfully approved library ${libraryId}. Manager: ${managerUserRecord.email}, Temp Password: ${tempPassword || 'N/A'}`,
    );

    return {
      status: 'success',
      message: `Library ${basicInfo.libraryName || ''} approved successfully.`,
      tempPassword: tempPassword, // Sending back for admin's info
    };
  } catch (error) {
    logger.error('Error approving library:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', 'An unexpected error occurred while approving the library.');
  }
});
