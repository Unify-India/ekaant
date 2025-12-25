import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as logger from 'firebase-functions/logger';
import { storage } from '../lib/firebaseAdmin';
import { v4 as uuidv4 } from 'uuid';
import { DEPLOYMENT_REGION } from '../config';

const BUCKET_NAME = process.env.GCLOUD_STORAGE_BUCKET || '';
const ALLOWED_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Creates and returns a v4 signed URL for resumable uploads.
 * This allows clients to upload files directly to Google Cloud Storage
 * in a secure manner.
 *
 * @param {functions.https.CallableRequest} request - The request object from the
 *   callable function. Expected data: `{ contentType: string }`.
 * @returns {Promise<{success: boolean, url: string}>} An object with the
 *   signed URL for the client to use for uploading the file.
 * @throws {HttpsError} - `unauthenticated` if the user is not logged in.
 * @throws {HttpsError} - `invalid-argument` if the content type is missing
 *   or not allowed.
 */
export const getSignedUploadUrl = onCall(
  {
    region: DEPLOYMENT_REGION,
    maxInstances: 10,
  },
  async (request) => {
    // 1. Validate user authentication
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'You must be logged in to upload a file.');
    }

    // 2. Validate the request payload
    const contentType = request.data.contentType as string;
    if (!contentType) {
      throw new HttpsError('invalid-argument', 'Missing "contentType" in request.');
    }

    if (!ALLOWED_CONTENT_TYPES.includes(contentType)) {
      throw new HttpsError('invalid-argument', `Content type "${contentType}" is not allowed.`);
    }

    // 3. Define file path and options for the signed URL
    const fileExtension = contentType.split('/')[1];
    const uniqueFilename = `${uuidv4()}.${fileExtension}`;
    const filePath = `user-uploads/${request.auth.uid}/${uniqueFilename}`;

    const options = {
      version: 'v4' as const,
      action: 'write' as const,
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
      contentType: contentType,
      extensionHeaders: {
        'x-goog-content-length-range': `0,${MAX_FILE_SIZE}`,
      },
    };

    // 4. Generate the signed URL
    try {
      const bucket = storage.bucket(BUCKET_NAME);
      const file = bucket.file(filePath);
      const [url] = await file.getSignedUrl(options);

      logger.info(`Generated signed URL for user ${request.auth.uid} to upload` + ` to ${filePath}`);

      return { success: true, url };
    } catch (error) {
      logger.error('Error creating signed URL:', error);
      throw new HttpsError('internal', 'An unexpected error occurred while preparing the file upload.');
    }
  },
);
