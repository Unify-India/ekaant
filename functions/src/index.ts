import * as logger from 'firebase-functions/logger';
import * as functionsV1 from 'firebase-functions/v1'; // For V1 auth triggers

// This file is the main entrypoint for all Firebase Functions.
// We import functions from their individual files and export them here,
// grouped by feature, to ensure they are discovered and deployed by Firebase.

// Auth Triggers Logic
import { onStudentSignupLogic } from './auth/onStudentSignup';
import { onUserDeleteLogic } from './auth/onUserDelete';

// Registration Callable Functions
import { approveLibrary } from './registration/approveLibrary';
import { rejectLibrary } from './registration/rejectLibrary';
import { libraryRegistrationRequest } from './registration/libraryRegistrationRequest';

// Booking Triggers
import { transferSeatOnCheckout } from './booking/transferSeatOnCheckout';

// Uploads
import { getSignedUploadUrl } from './uploads/getSignedUploadUrl';

logger.info('Functions cold start');

// Export V1 Auth Triggers (as V2 does not directly support them yet)
export const authOnStudentSignup = functionsV1.auth.user().onCreate(onStudentSignupLogic);
export const authOnUserDelete = functionsV1.auth.user().onDelete(onUserDeleteLogic);

// Export V1 Booking Triggers
export const bookingOnSeatCheckout = transferSeatOnCheckout;

// Export V2 Callable Functions
export const registration = {
  approveLibrary: approveLibrary,
  rejectlibrary: rejectLibrary,
  libraryregistrationrequest: libraryRegistrationRequest,
};

export const uploads = {
  getsigneduploadurl: getSignedUploadUrl,
};
