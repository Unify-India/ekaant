import * as admin from 'firebase-admin';
import { db } from '../lib/firebaseAdmin'; // Assuming db is initialized from firebase-admin
import * as logger from 'firebase-functions/logger';

// Import for typing only
import type * as functions from 'firebase-functions/v1';

/**
 * Logic to set custom claims on a Firebase Auth user based on their role
 * stored in Firestore when a new Firebase Auth user is created.
 *
 * @param {functions.auth.UserRecord} user - The Firebase Auth UserRecord
 *   object.
 * @return {Promise<void>} A promise that resolves when the custom claims are set.
 */
export const onUserSignupLogic = async (user: functions.auth.UserRecord) => {
  const { uid, email } = user;

  try {
    // Wait for the Firestore document to be created by the client-side registration
    // This assumes the client-side `AuthService.registerWithEmailAndPassword`
    // has already created the user document in Firestore with the correct role.
    const userDocRef = db.collection('users').doc(uid);
    const userDoc = await userDocRef.get();

    if (!userDoc.exists) {
      logger.warn(`Firestore user document not found for ${uid}. Custom claims not set.`);
      return;
    }

    const userData = userDoc.data() as { role: string; email: string };
    const userRole = userData.role;

    if (!userRole) {
      logger.warn(`Role not found in Firestore document for user ${uid}. Custom claims not set.`);
      return;
    }

    // Set custom claims
    await admin.auth().setCustomUserClaims(uid, { role: userRole });
    logger.info(`Custom claim 'role: ${userRole}' set for user ${uid} (${email}).`);

    // Optionally, if you want to notify the user client-side,
    // you could force a token refresh here, though Firebase's
    // onIdTokenChanged usually handles this within an hour or so.
    // admin.auth().revokeRefreshTokens(uid); // This would force immediate re-authentication

  } catch (error) {
    logger.error(`Error setting custom claims for user ${uid}:`, error);
  }
};
