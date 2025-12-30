import * as logger from 'firebase-functions/logger';
import * as functionsV1 from 'firebase-functions/v1'; // For V1 auth triggers
import { DEPLOYMENT_REGION } from './config';

// This file is the main entrypoint for all Firebase Functions.
// We import functions from their individual files and export them here,
// grouped by feature, to ensure they are discovered and deployed by Firebase.

// Auth Triggers Logic
import { onUserSignupLogic } from './auth/onUserSignup';
import { onUserDeleteLogic } from './auth/onUserDelete';

// Registration Callable Functions
import { approveLibrary } from './registration/approveLibrary';
import { rejectLibrary } from './registration/rejectLibrary';
import { libraryRegistrationRequest } from './registration/libraryRegistrationRequest';

// Booking Triggers
import { transferSeatOnCheckout } from './booking/transferSeatOnCheckout';

// Booking Callables
import { getLibraryConfig } from './booking/getLibraryConfig';
import { getAvailableSlots } from './booking/getAvailableSlots';
import { allocateSeat } from './booking/allocateSeat';
import { cancelBooking } from './booking/cancelBooking';
import { createSubscription } from './booking/createSubscription';
import { managerApproveSeat } from './booking/managerApproveSeat';

// Uploads
import { getSignedUploadUrl } from './uploads/getSignedUploadUrl';


logger.info('Functions cold start');

// Export V1 Auth Triggers (as V2 does not directly support them yet)
export const authOnUserSignup = functionsV1.region(DEPLOYMENT_REGION).auth.user().onCreate(onUserSignupLogic);
export const authOnUserDelete = functionsV1.region(DEPLOYMENT_REGION).auth.user().onDelete(onUserDeleteLogic);

// Export V1 Booking Triggers
export const bookingOnSeatCheckout = transferSeatOnCheckout;

// Export V2 Callable Functions
export const registration = {
  approveLibrary: approveLibrary,
  rejectLibrary: rejectLibrary,
  libraryRegistrationRequest: libraryRegistrationRequest,
};

export const booking = {
  getLibraryConfig: getLibraryConfig,
  getAvailableSlots: getAvailableSlots,
  allocateSeat: allocateSeat,
  cancelBooking: cancelBooking,
  createSubscription: createSubscription,
  managerApproveSeat: managerApproveSeat,
};

export const uploads = {
  getSignedUploadUrl: getSignedUploadUrl,
};
