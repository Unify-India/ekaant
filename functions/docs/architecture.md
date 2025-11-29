# Cloud Functions Architecture Overview

This document provides a high-level overview of the architecture for the Ekaant Firebase Cloud Functions.

## 1. Directory Structure & Organization

The Cloud Functions are organized by feature domain within the `functions/src` directory. This modular approach keeps related logic together, making the codebase easier to navigate, maintain, and test.

```
/functions
└── /src
    ├── /auth         # Auth-triggered functions (e.g., on user creation)
    ├── /booking      # Business logic related to seat bookings
    ├── /registration # Handles library registration, approval, rejection
    ├── /uploads      # Functions for handling file uploads
    ├── index.ts      # Main entry point for deploying all functions
    └── ...
```

Each feature directory contains individual files for each function (e.g., `approveLibrary.ts`).

## 2. Function Triggers

We leverage two main types of Cloud Function triggers:

1.  **HTTPS Callable Functions**: These are secure, client-callable HTTP endpoints used for specific actions initiated by the user, such as an admin approving a library. They automatically deserialize the request body and handle CORS. All our callable functions are defined in `v2`.

2.  **Background Triggers (Auth, Firestore)**: These functions react to events within the Firebase ecosystem. For example, an `onDelete` auth trigger cleans up user data, and an `onWrite` Firestore trigger can update aggregate data. We use `v1` for Auth triggers as `v2` support is not yet fully mature.

## 3. Naming Convention

To provide clarity in Firebase logs and the console, functions are exported with a consistent naming convention: **`{groupName}-{functionName}`**.

-   **Example**: The `approveLibrary` function within the `registration` group is exported as `registration-approveLibrary`.

This grouping is handled in the main `index.ts` file.

## 4. Main Entry Point (`index.ts`)

The `functions/src/index.ts` file acts as the central hub for all Cloud Functions. It imports individual function logic from the feature modules and exports them in structured groups. This is the single entry point that the Firebase CLI uses for deployment, ensuring all functions are discovered and deployed correctly.

## 5. Security Model

Security is a primary consideration in our backend architecture.

-   **Callable Functions**: Every callable function begins with a check on `context.auth`. It verifies that a user is authenticated and, where necessary, checks for specific custom claims (e.g., `context.auth.token.role === 'admin'`) to enforce role-based access control (RBAC).

-   **Firestore Security Rules**: While Cloud Functions operate in a trusted, server-side environment (bypassing security rules by default), our database is still protected by comprehensive Firestore Security Rules (`firestore.rules`). This ensures that even if a client-side action is attempted, the database remains secure. Functions provide the *logic*, while rules provide the *security layer*.
