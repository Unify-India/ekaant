# Student: Backend Features & Responsibilities

This document outlines the backend features, Cloud Functions, and user stories specifically related to the **Student** role, who is the primary end-user of the Ekaant platform.

---

## 1. Core Interactions

The student's journey revolves around finding, joining, and using library facilities. The backend must support these core interactions securely and efficiently.

1.  **Onboarding:** Signing up and creating a verified profile.
2.  **Discovery & Application:** Browsing for libraries and applying for a seat.
3.  **Status Tracking:** Viewing the real-time status of their application (Pending, Approved, Waitlisted).
4.  **Attendance:** Checking in and out of the library to manage their seat usage.
5.  **Payments:** Making payments for their seat reservation.

---

## 2. Student-Centric Cloud Functions

The following Firebase Functions are either triggered by student actions or run in the background to manage the student lifecycle.

| Function Module | Function Name              | Trigger Type   | Description                                                                                                                                                                      |
| :-------------- | :------------------------- | :------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Auth**        | `onStudentSignup`          | `Auth Trigger` | When a new user signs up, this function automatically creates a corresponding user document in the `USERS` collection with the role `student`.                                   |
| **Booking**     | `applyForLibrarySeat`      | `onCall`       | Called by the student's client when they apply to a library. Creates a `STUDENT_REQUESTS` document with `status: 'pending'` and denormalizes `studentName` for the manager's UI. |
| **Waiting**     | `confirmWaitingAssignment` | `onCall`       | If a student is offered a seat from the waiting list, they call this function to accept it within a specific time frame.                                                         |
| **Attendance**  | `checkInStudent`           | `onCall`       | Creates an `ATTENDANCE_LOGS` entry. This is a primary trigger for the `updateOccupancyStats` function, which updates the manager's real-time dashboard.                          |
| **Attendance**  | `checkOutStudent`          | `onCall`       | Closes an attendance log. This is a primary trigger for the `updateOccupancyStats` function, which updates the manager's real-time dashboard.                                    |
| **Payments**    | `recordPayment`            | `onCall`       | Submits payment details for manager confirmation. Creates a `PAYMENTS` document with a `bookingCode` and denormalized `studentName`.                                             |

---

## 3. Key User Stories & Backend Flow

### a. Signing Up and Applying to a Library

- **User Story:** "As a new student, I want to sign up, complete my profile with an identity proof, browse libraries, and apply to one that suits me."
- **Backend Flow:**
  1.  **Signup:** Student signs up via the app. Firebase Authentication creates a user record.
  2.  **Trigger:** The `onStudentSignup` Auth trigger fires, creating a document in the `USERS` collection with `role: 'student'`.
  3.  **Profile Completion:** Student uploads an ID proof. The client uploads the file to a specific path in Firebase Storage, protected by security rules ensuring only the authenticated user can write to their own folder (`/users/{uid}/proof.jpg`).
  4.  **Apply:** Student clicks "Apply" for a library.
  5.  **Callable Function:** The client calls the `applyForLibrarySeat` function, passing the `libraryId`.
  6.  **Action:** The function creates a new document in the `STUDENT_REQUESTS` collection, linking the `studentId`, `libraryId`, `studentName`, and setting `status: 'pending'`. A notification may be triggered to the Library Manager.

### b. Checking Application Status

- **User Story:** "As a student, I want to see the real-time status of my library application (Pending, Approved, Waitlisted) on my dashboard."
- **Backend Flow:**
  1.  The student's dashboard on the client application initiates a Firestore query.
  2.  The query listens for real-time updates on the `STUDENT_REQUESTS` collection, filtered by `where('studentId', '==', currentUser.uid)`.
  3.  Firestore Security Rules ensure a student can only read requests where their own `studentId` is present.
  4.  When a Library Manager or Admin changes the status of the request document, the change is pushed instantly to the student's dashboard.
