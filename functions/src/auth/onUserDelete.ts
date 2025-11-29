import { db } from '../lib/firebaseAdmin';
import * as logger from 'firebase-functions/logger';
// Import for typing only
import type * as functions from 'firebase-functions/v1';

/**
 * Logic to delete the corresponding user document from Firestore when a
 * Firebase Auth user is deleted.
 *
 * @param {functions.auth.UserRecord} user - The Firebase Auth UserRecord object
 *   of the deleted user.
 * @return {Promise<void>} A promise that resolves when the document is deleted.
 */
export const onUserDeleteLogic = async (user: functions.auth.UserRecord) => {
  const { uid } = user;
  const userRef = db.collection('users').doc(uid);

  try {
    await userRef.delete();
    logger.info(`User document deleted for ${uid}`);
  } catch (error) {
    logger.error(`Error deleting user document for ${uid}:`, error);
  }
};
