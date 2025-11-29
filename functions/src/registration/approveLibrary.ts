import * as functions from 'firebase-functions/v1';
import * as admin from 'firebase-admin';
import { CallableContext } from 'firebase-functions/v1/https';

/**
 * Handles the approval of a library registration request.
 *
 * This HTTP-triggered function performs the following actions:
 * 1. Verifies that the request is made by an authenticated admin user.
 * 2. Reads the library registration request from Firestore.
 * 3. Creates a new Firebase Authentication user for the library manager.
 * 4. Sets custom claims (`role: 'manager'`, `libraryId`) for the new manager user.
 * 5. Creates a new public document for the library in the `libraries` collection.
 * 6. Updates the original registration request's status to 'approved'.
 *
 * @param {functions.https.Request} request - The HTTP request object, containing the `registrationId`.
 * @param {functions.https.Response} response - The HTTP response object.
 */
export const approveLibrary = functions
  .region('asia-south1')
  .https.onCall(async (data: { registrationId: string }, context: CallableContext) => {
    // 1. Authentication & Authorization Check
    if (!context.auth || context.auth.token.role !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'This function must be called by an admin.');
    }

    const { registrationId } = data;
    if (!registrationId) {
      throw new functions.https.HttpsError('invalid-argument', 'The function must be called with a "registrationId".');
    }

    const db = admin.firestore();
    const registrationRequestRef = db.collection('library-registrations').doc(registrationId);

    try {
      const registrationDoc = await registrationRequestRef.get();
      if (!registrationDoc.exists) {
        throw new functions.https.HttpsError('not-found', `Registration request with ID ${registrationId} not found.`);
      }

      const registrationData = registrationDoc.data()!;

      // Prevent re-approval
      if (registrationData.applicationStatus === 'approved') {
        throw new functions.https.HttpsError('failed-precondition', 'This library has already been approved.');
      }

      // 2. Create Library Manager Auth User
      const managerEmail = registrationData.contactInfo.email;
      const managerPassword = Math.random().toString(36).slice(-8); // Generate a random temporary password

      const managerUserRecord = await admin.auth().createUser({
        email: managerEmail,
        password: managerPassword,
        displayName: registrationData.contactInfo.name,
      });

      // 3. Set Custom Claims
      const libraryId = registrationRequestRef.id; // Use the registration ID as the new library ID
      await admin.auth().setCustomUserClaims(managerUserRecord.uid, {
        role: 'manager',
        libraryId: libraryId,
      });

      // 4. Create Public `libraries` Document
      const libraryRef = db.collection('libraries').doc(libraryId);
      await libraryRef.set({
        name: registrationData.libraryName,
        ownerId: managerUserRecord.uid,
        managerIds: [managerUserRecord.uid],
        location: registrationData.location,
        seatConfig: registrationData.seatConfig,
        amenities: registrationData.amenities,
        status: 'approved',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        // Initialize ratings
        averageRating: 0,
        totalReviews: 0,
        ratingsBreakdown: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
      });

      // 5. Update Original Request Status
      await registrationRequestRef.update({
        applicationStatus: 'approved',
        approvedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // TODO: 6. Send Welcome Email
      // This part can be implemented later. It would involve a transactional email service.
      console.log(
        `Successfully approved library ${libraryId}. Manager: ${managerEmail}, Temp Password: ${managerPassword}`,
      );

      return {
        status: 'success',
        message: `Library ${registrationData.libraryName} approved successfully.`,
        tempPassword: managerPassword, // Sending back for admin's info
      };
    } catch (error) {
      console.error('Error approving library:', error);
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      throw new functions.https.HttpsError('internal', 'An unexpected error occurred while approving the library.');
    }
  });
