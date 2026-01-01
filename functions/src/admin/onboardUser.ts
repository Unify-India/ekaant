import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { db, auth } from '../lib/firebaseAdmin';
import { DEPLOYMENT_REGION } from '../config';

interface OnboardUserRequest {
  email: string;
  password?: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  idCardNumber: string;
  acPreference: boolean;
  libraryId: string;
  planDetails: {
    planName: string;
    billingCycle: string;
    amount: number;
    paymentDate: string; // ISO string
    startDate: string; // ISO string
    startTime?: string;
    endTime?: string;
  };
}

/**
 * Onboards a student by creating a Firebase Auth account and a Firestore user profile.
 * This is called by Managers or Admins.
 */
export const onboardUser = onCall({ region: DEPLOYMENT_REGION }, async (request) => {
  // 1. Authentication Check
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  // 2. Authorization Check (Manager or Admin)
  const callerRole = request.auth.token.role;
  if (callerRole !== 'admin' && callerRole !== 'manager') {
    throw new HttpsError('permission-denied', 'Only admins or managers can onboard users.');
  }

  const data = request.data as OnboardUserRequest;
  const { email, fullName, phoneNumber, address, idCardNumber, acPreference, libraryId, planDetails } = data;
  let { password } = data;

  if (!email || !libraryId || !fullName) {
    throw new HttpsError('invalid-argument', 'Email, Full Name, and Library ID are required.');
  }

  // Generate a random password if not provided
  if (!password) {
    password = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
  }

  try {
    // 3. Create Firebase Auth User
    let userRecord;
    try {
      userRecord = await auth.createUser({
        email,
        password,
        displayName: fullName,
        phoneNumber: phoneNumber || undefined,
        emailVerified: true, // Manager verified them in person
      });
    } catch (e: any) {
      if (e.code === 'auth/email-already-in-use') {
        throw new HttpsError('already-exists', 'The email address is already in use by another account.');
      }
      if (e.code === 'auth/phone-number-already-exists') {
        throw new HttpsError('already-exists', 'The phone number is already in use by another account.');
      }
      throw e;
    }

    const uid = userRecord.uid;

    // 4. Set Custom Claims (Student role)
    await auth.setCustomUserClaims(uid, { role: 'student' });

    // 5. Create Firestore User Document
    const userData = {
      uid: uid,
      email: email,
      displayName: fullName,
      phoneNumber: phoneNumber,
      role: 'student',
      status: 'active',
      verified: true,
      createdAt: new Date(),

      // Profile
      address: address,
      idCardNumber: idCardNumber,
      acPreference: acPreference,

      // Context
      libraryId: libraryId,
      primaryLibraryId: libraryId,
      associatedLibraries: {
        enrolled: libraryId,
        applied: [],
        previous: [],
      },
      currentSubscription: {
        planName: planDetails.planName,
        billingCycle: planDetails.billingCycle,
        amount: planDetails.amount,
        paymentDate: new Date(planDetails.paymentDate),
        startDate: new Date(planDetails.startDate),
        startTime: planDetails.startTime,
        endTime: planDetails.endTime,
      },
      profileCompleted: true, 
      profileCompletion: 100
    };

    // Write to root users collection
    await db.collection('users').doc(uid).set(userData);

    // Write to library subcollection
    await db.collection('libraries').doc(libraryId).collection('users').doc(uid).set(userData);

    logger.info(`Onboarded student ${uid} (${email}) for library ${libraryId} by ${request.auth.uid}`);

    return {
      status: 'success',
      uid: uid,
      email: email,
      password: password,
      message: 'User onboarded successfully.',
    };

  } catch (error) {
    logger.error('Error onboarding user:', error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError('internal', 'Unable to onboard user.');
  }
});
