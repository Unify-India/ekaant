# Manager: Backend Features & Responsibilities

This document outlines the backend features, Cloud Functions, and user stories specifically related to the **Library Manager** role in the Ekaant platform.

---

## 1. Core Responsibilities

The Library Manager is the owner or operator of a library registered on the Ekaant platform. Their primary responsibilities involve managing their specific library's operations and users.

1.  **Profile & Setup:** Completing and maintaining the detailed library profile after initial admin approval.
2.  **Student Onboarding:** Managing applications from students, including approval, rejection, and waitlisting.
3.  **Payment Verification:** Confirming and recording payments made by students (initially cash-based).
4.  **SaaS Subscription:** Managing the library's subscription to the Ekaant platform itself.

### 1.a. Manager Profile Data Model

While the `LIBRARIES` collection holds data about the physical library, the `USERS` document for a manager should store their personal information. This ensures a manager's personal data is separate from the library's operational data, which is crucial as they could potentially manage multiple libraries.

A `user` document with the `role: 'manager'` should contain:

*   **`uid`**: The user's unique Firebase Authentication ID.
*   **`email`**: The manager's login email.
*   **`displayName`**: The manager's full name.
*   **`phoneNumber`**: The manager's personal contact number.
*   **`photoURL`**: A URL to their profile picture.
*   **`roleInLibrary`**: A string describing their position (e.g., "Owner", "Head Manager", "Staff").
*   **`verification`**: An object containing identity verification details.
    *   **`idType`**: e.g., "Aadhaar", "PAN Card".
    *   **`idNumber`**: The number of the provided ID.
    *   **`idDocumentUrl`**: A Firebase Storage URL to the scanned document.
    *   **`status`**: 'verified', 'pending', 'rejected'.


---

## 2. Manager-Specific Cloud Functions

The following Firebase Functions are designed to be called by authenticated Library Managers. They must be protected by an `authGuard` middleware that verifies the caller has a `manager` custom claim and has authority over the specified `libraryId`.

| Function Module | Function Name | Trigger Type | Description |
| :--- | :--- | :--- | :--- |
| **Booking** | `managerApproveSeat` | `onCall` | Approves a student's application for a specific library. This function updates the student's status for that library and can trigger a notification to the student. |
| **Payments** | `confirmPayment` | `onCall` | Called by the manager to confirm that a student's cash payment has been received. This updates the student's payment status in Firestore. |
| **Subscriptions**| `createSubscription` | `onCall` | Called when a manager selects a SaaS plan. This function interacts with the payment provider (e.g., Stripe) and creates a `librarySubscriptions` document. |

---

## 3. Key User Stories & Backend Flow

### a. Approving a Student Application

*   **User Story:** "As a library manager, I want to **approve or reject student registration requests** for my library based on seat availability and upon receiving cash payment."
*   **Backend Flow:**
    1.  Manager clicks "Approve" for a pending student request in their dashboard.
    2.  The client calls the `managerApproveSeat` callable function, passing the `studentId` and `libraryId`.
    3.  The `authGuard` middleware verifies the caller is a Manager and controls the given `libraryId`.
    4.  The function updates the `student_requests` document status to 'approved'.
    5.  A `sendNotification` utility is called to send a push notification or email to the student, informing them of the approval.

### b. Placing a Student on the Waiting List

*   **User Story:** "As a library manager, if there are no seats available, I want to **put a student's registration request into a waiting list**."
*   **Backend Flow:**
    1.  This is a variation of the approval flow. The manager clicks "Add to Waitlist".
    2.  The client calls a function (e.g., `updateStudentApplicationStatus`) or uses the same `managerApproveSeat` function with a different parameter.
    3.  The backend function updates the `student_requests` document status to 'waiting_list'.
    4.  A document may also be created in the `WAITING_LIST` collection to formally place them in the queue.

### c. Subscribing to an Ekaant SaaS Plan

*   **User Story:** "As a library manager, I want to choose a pricing plan and subscribe my library to the Ekaant service so I can be listed on the platform."
*   **Backend Flow:**
    1.  Manager selects a plan on the frontend.
    2.  The client calls the `createSubscription` callable function with the chosen `planId`.
    3.  The `authGuard` verifies the manager's identity.
    4.  The function communicates with the payment provider (e.g., Stripe) to create a subscription object.
    5.  It receives a `paymentProviderSubscriptionId` in return.
    6.  The function then creates a new document in the `librarySubscriptions` collection in Firestore, storing the plan details and provider ID. The initial status is set to `trialing` or `active` depending on the plan.
