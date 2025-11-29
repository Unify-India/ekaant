import { db } from '../lib/firebaseAdmin';
import { UserRole } from '../types/enums';
import type { User } from '../types';
import * as logger from 'firebase-functions/logger';
// Import for typing only
import type * as functions from 'firebase-functions/v1';

/**
 * Logic to create a user document in Firestore when a new Firebase Auth user
 * is created.
 *
 * @param {functions.auth.UserRecord} user - The Firebase Auth UserRecord
 *   object.
 * @return {Promise<void>} A promise that resolves when the document is created.
 */
export const onStudentSignupLogic = async (user: functions.auth.UserRecord) => {
  const { uid, email, displayName, phoneNumber } = user;

  const userRef = db.collection('users').doc(uid);

  const newUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
    email: email || '',
    name: displayName || 'New User',
    phone: phoneNumber || '',
    role: UserRole.Student, // Default role
    verificationStatus: false, // Default status
  };

  try {
    await userRef.set({
      ...newUser,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    logger.info(`User document created for ${uid}`);
  } catch (error) {
    logger.error(`Error creating user document for ${uid}:`, error);
  }
};
