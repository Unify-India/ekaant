# Project Context Saved (November 5, 2025)

This document summarizes the current state of the Ekaant project and the ongoing development plan, as discussed with the Gemini CLI agent.

## 1. Project Overview

*   **Project Name:** Ekaant
*   **Goal:** Mobile-first platform for library management, focusing on self-study cubicles and book lending in the Indian market. USP: Monetizing unused (no-show) cubicle slots.
*   **Tech Stack:** Ionic (Angular) for Frontend, Firebase (Firestore, Authentication, Storage, Cloud Functions) for Backend, Capacitor for Native Builds.
*   **User Roles:** Student, Library Manager, Admin.

## 2. Recent Progress

### a. Documentation Updates
*   **`docs/plan/frontend.md`:** Updated to include:
    *   "Implementation Status" for each feature in the "Project Feature List".
    *   "Status & Path" for each page in the "Pages and Views Involved" section.
    *   A new section for "Shared Components".
    *   A new section "Brainstorming & Future Enhancements" with ideas for No-Show Monetization, Enhanced Manager Analytics, and Student Gamification.
    *   A new section "Pending MVP Features by Role" outlining specific features to be implemented for Admin, Manager, and Student roles.
*   **`docs/db schema.md`:** Updated to include:
    *   A more detailed `users` collection schema with `role`, `profileCompleted`, `verified` fields.
    *   A new `libraryRegistrationRequests` collection to store pending library applications.
    *   A refined `libraries` collection schema for approved libraries, designed for efficient reading.
    *   A new `studentApplications` collection for managing student applications to libraries.

### b. Admin UI Implementation
*   **Library Registration Management Page (`/admin/pending-requests`):**
    *   **UI:** Implemented with a responsive table-style layout using `ion-grid`.
    *   **Functionality:** Displays a list of pending library requests (currently with mock data).
    *   **Actions:** Includes "View", "Edit", and "Delete" buttons for each request.
    *   **Files:** `src/app/admin/library-requests/library-requests.page.ts`, `.html`, `.scss`.
*   **Edit Library Registration Page (`/admin/library-request-detail/:id`):**
    *   **UI:** Implemented with a card-based layout and outlined, floating-label inputs, matching the `application-form` style.
    *   **Functionality:** Displays details of a single library request (currently with mock data).
    *   **Modes:** Supports both "Edit" and "View-Only" modes, controlled by a query parameter (`?mode=view`). In view-only mode, form fields are disabled, and action buttons are hidden.
    *   **Files:** `src/app/admin/library-request-detail/library-request-detail.page.ts`, `.html`, `.scss`.

## 3. Current Status & Next Steps

The frontend UI for the Admin's library approval workflow is complete and styled consistently. The next phase focuses on integrating this UI with the Firebase backend.

**Agreed-Upon Next Steps:**

1.  **Connect Library Requests List to Firestore:**
    *   Modify `src/app/admin/library-requests/library-requests.page.ts` to fetch actual `libraryRegistrationRequests` from the Firestore collection.
2.  **Connect Library Request Detail Page to Firestore:**
    *   Modify `src/app/admin/library-request-detail/library-request-detail.page.ts` to fetch specific request data by ID from Firestore.
    *   Implement the `update()` method to save changes (including `applicationStatus` and `adminComments`) back to the Firestore document.
3.  **Develop "Approve Library" Backend Logic (Cloud Function):**
    *   Create a Firebase Cloud Function (e.g., `onLibraryRequestApprove`) that triggers when a `libraryRegistrationRequests` document's `applicationStatus` is set to "approved".
    *   This function will:
        *   Read the data from the approved request.
        *   Create a new document in the `libraries` collection.
        *   Create a new Firebase Auth user for the Library Manager.
        *   Set a custom claim (`role: 'manager'`) for the new user.
        *   (Optional) Send an email to the manager with login credentials.

This plan will fully implement the "Approve Library" feature, from frontend UI to backend data and user management.
