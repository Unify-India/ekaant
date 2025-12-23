# Admin: Backend Features & Responsibilities

This document outlines the backend features, Cloud Functions, and user stories specifically related to the **Admin** role in the Ekaant platform.

---

## 1. Core Responsibilities

The Admin user is the system operator and platform gatekeeper. Their primary responsibilities, from a backend perspective, are:

1.  **Vetting & Onboarding Libraries:** Approving or rejecting new library registration requests to ensure authenticity and quality.
2.  **User & Access Management:** Creating credentials for Library Managers and managing user roles and claims.
3.  **Platform Oversight:** Monitoring user-submitted feedback and performing high-level administrative tasks.

---

## 2. Admin-Specific Cloud Functions

The following Firebase Functions are dedicated to performing Admin-level tasks. They must be protected by an `authGuard` middleware that verifies the caller has an `admin: true` custom claim.

| Function Module  | Function Name                  | Trigger Type        | Description                                                                                                                                                                         |
| :--------------- | :----------------------------- | :------------------ | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Registration** | `approveLibrary`               | `onCall`            | Approves a pending library request. Creates a Firebase Auth user for the manager, sets their `manager` custom claim, and moves the library data to the main `libraries` collection. |
| **Registration** | `rejectLibrary`                | `onCall`            | Rejects a pending library request, adding a reason for the rejection.                                                                                                               |
| **Auth**         | `manageClaims`                 | `onCall`            | A general-purpose function for an Admin to set custom claims on any user (e.g., promoting a user to 'manager' or 'admin').                                                          |
| **Admin**        | `assignVerificationAgent`      | `onCall`            | Assigns a specific admin or agent to a library for on-site verification purposes (Future Scope).                                                                                    |
| **Admin**        | `auditLogWriter`               | `onCall`            | A secure, server-side-only wrapper for writing sensitive activities to an `audit_logs` collection.                                                                                  |
| **Registration** | `onLibraryRegistrationRequest` | `Firestore Trigger` | (Passive) Notifies all admins via email or push notification when a new library submits a registration request.                                                                     |

---

## 3. Key User Stories & Backend Flow

### a. Approving a New Library

- **User Story:** "As an administrator, after reviewing the submitted library details and proof of ownership, I want to be able to **approve the library registration request**."
- **Backend Flow:**
  1.  Admin clicks "Approve" in the frontend application.
  2.  The client calls the `approveLibrary` callable function.
  3.  The `authGuard` middleware on the function verifies the caller is an Admin.
  4.  The function executes a transaction:
      - Reads the document from the `library-registrations` collection.
      - Creates a new Firebase Auth user for the Library Manager using the provided email.
      - Sets a temporary password and emails the credentials to the manager.
      - Sets custom claims for the new manager user: `{ role: 'manager', libraryId: '...' }`.
      - Copies the registration data to a new document in the main `libraries` collection.
      - Deletes the original request from `library-registrations`.
      - Writes an entry to the `audit_logs`.

### b. Managing User Feedback

- **User Story:** "As an administrator, I want to **view all submitted feedback/support requests** from students and managers so I can address their queries or issues."
- **Backend Flow:**
  1.  The Admin frontend reads directly from the `feedback_support` collection in Firestore.
  2.  Security rules ensure that only users with the `admin` role can list all documents in this collection.
  3.  (Future) A function could be added to assign a ticket to a support agent or update its status.
