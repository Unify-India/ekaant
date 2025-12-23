import * as functions from 'firebase-functions/v1';
import * as logger from 'firebase-functions/logger';
import { db } from '../lib/firebaseAdmin';
import { add } from 'date-fns';
// Assume a utility function for sending notifications exists
// import { sendNotification } from '../utils/sendNotification';

/**
 * Logic to find the next student on the waiting list and offer them a seat
 * when an attendance session ends.
 *
 * @param {string} libraryId - The ID of the library where a seat was freed.
 */
async function assignSeatFromWaitingList(libraryId: string) {
  const waitingListRef = db
    .collection('waiting_list')
    .where('libraryId', '==', libraryId)
    .where('status', '==', 'active')
    .orderBy('createdAt', 'asc')
    .limit(1);

  const snapshot = await waitingListRef.get();

  if (snapshot.empty) {
    logger.info(`No active students on waiting list for library ${libraryId}.`);
    return;
  }

  const nextStudentEntry = snapshot.docs[0];
  const thirtyMinutesFromNow = add(new Date(), { minutes: 30 });

  await nextStudentEntry.ref.update({
    status: 'offered',
    expiresAt: thirtyMinutesFromNow,
  });

  const studentId = nextStudentEntry.data().studentId;
  logger.info(
    `Offered seat to student ${studentId} from waiting list for library ` +
      `${libraryId}. Offer expires at ${thirtyMinutesFromNow.toISOString()}.`,
  );

  // TODO: Implement actual push notification logic
  // await sendNotification(studentId, {
  //   title: 'A Seat is Available!',
  //   body: `A seat has opened up at your library. You have 30 minutes to
  //     confirm it.`,
  // });
}

/**
 * Firestore trigger that runs when an attendance log is updated.
 *
 * It checks if a user has just checked out, and if so, attempts to assign
 * the newly freed seat to the next person on the waiting list.
 */
export const transferSeatOnCheckout = functions.firestore
  .document('attendance_logs/{logId}')
  .onUpdate(async (change) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // A seat is freed if checkOut time is newly added.
    const justCheckedOut = !beforeData.checkOut && afterData.checkOut;

    if (justCheckedOut) {
      const libraryId = afterData.libraryId;
      if (!libraryId) {
        logger.error(`Attendance log ${change.after.id} is missing a libraryId.`);
        return;
      }

      logger.info(
        `Student ${afterData.studentId} checked out from library ` + `${libraryId}. Checking waiting list...`,
      );

      await assignSeatFromWaitingList(libraryId);
    }
  });
