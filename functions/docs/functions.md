# Ekaant Cloud Functions API Reference

This document provides a detailed reference for the key Cloud Functions used in the Ekaant project.

---

## Group: `registration`

This group of functions handles the entire lifecycle of a library's application process.

### 1. `registration-approveLibrary`

-   **Trigger**: HTTPS Callable (`v2`)
-   **Description**: The primary function for approving a new library registration. It performs all necessary backend steps to transition a pending request into an active, public library. This function is designed to be called only by an authenticated admin user.
-   **Parameters**:
    -   `registrationId` (string): The document ID of the library request in the `library-registrations` collection.
-   **Returns**:
    -   An object with `{ status: 'success', message: string, tempPassword: string }`.
-   **Error Codes**:
    -   `permission-denied`: If the caller is not an authenticated admin.
    -   `invalid-argument`: If the `registrationId` is missing.
    -   `not-found`: If the registration document does not exist.
    -   `failed-precondition`: If the library has already been approved.
    -   `internal`: For any unexpected server-side errors.
-   **Workflow**:
    1.  **Authorization**: Checks if the calling user has an `admin` role via `context.auth.token.role`.
    2.  **Fetch Data**: Reads the document from `/library-registrations/{registrationId}`.
    3.  **Create Auth User**: Creates a new Firebase Auth user for the library manager using the email from the registration data and generates a random temporary password.
    4.  **Set Custom Claims**: Assigns custom claims `{ role: 'manager', libraryId: registrationId }` to the new manager's user account for Role-Based Access Control (RBAC).
    5.  **Create Public Library**: Creates a new document in the `/libraries` collection with the same ID as the registration. It copies over relevant data and initializes rating/review fields.
    6.  **Update Request**: Updates the original registration document's `applicationStatus` to `approved`.
    7.  **(Future)**: Sends a welcome email to the manager with login credentials.

### 2. `registration-libraryRegistrationRequest`

-   **Trigger**: HTTPS Callable (`v2`)
-   **Description**: Handles the submission of a new library registration form. It creates a new document in the `library-registrations` collection.
-   **Parameters**: An object containing all the form data for a new library registration.
-   **Returns**: An object with the `id` of the newly created registration document.
-   **Workflow**:
    1.  Receives the library data from the frontend.
    2.  Adds `createdAt: serverTimestamp()` to the data.
    3.  Creates a new document in the `library-registrations` collection.
    4.  Returns the new document's ID.

### 3. `registration-rejectLibrary`

-   **Trigger**: HTTPS Callable (`v2`)
-   **Description**: Handles the rejection of a library application. It simply updates the status of the registration document.
-   **Parameters**:
    -   `registrationId` (string): The ID of the registration request.
    -   `adminComments` (string): The reason for the rejection.
-   **Returns**: A success message.
-   **Workflow**:
    1.  **Authorization**: Checks for an admin user.
    2.  Updates the document at `/library-registrations/{registrationId}` by setting `applicationStatus` to `rejected` and saving the `adminComments`.

---

## Group: `auth`

These functions are triggered by Firebase Authentication events.

### 1. `authOnStudentSignup`

-   **Trigger**: Authentication (`v1` - `onCreate`)
-   **Description**: Sets the default `student` role for any new user who signs up.
-   **Workflow**:
    1.  Triggers when a new user is created in Firebase Auth.
    2.  Sets a custom claim `{ role: 'student' }` for that user.

### 2. `authOnUserDelete`

-   **Trigger**: Authentication (`v1` - `onDelete`)
-   **Description**: Cleans up associated user data from Firestore when a user is deleted from Firebase Auth.
-   **Workflow**:
    1.  Triggers when a user is deleted.
    2.  Deletes the corresponding user profile document from the `/users/{userId}` collection in Firestore.
