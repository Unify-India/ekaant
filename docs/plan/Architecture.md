# Ekaant Backend Architecture

This document outlines the architecture, patterns, and best practices for the Ekaant Firebase Functions backend.

---

# Firebase Functions — Recommended Folder Structure (TypeScript, modular)

Below is a production-ready, modular folder layout for your Firebase Functions project. I recommend **TypeScript** (better type-safety) and one function entrypoint (`src/index.ts`) that exports all callable / background functions. Each module lives in its own folder and exposes functions through that module. I also include supporting files (config, utils, tests, deployment scripts) and notes on what each file does.

```
functions/                                # root of Firebase Functions
├─ package.json
├─ tsconfig.json
├─ .eslintrc.js
├─ .prettierrc
├─ firebase.json                          # functions hosting config (optional)
├─ .runtimeconfig.json (or use env vars)  # optional local config
├─ src/
│  ├─ index.ts                            # exports all functions
│  ├─ config/
│  │  └─ index.ts                         # typed config loader (process.env or functions.config())
│  ├─ lib/
│  │  ├─ firebaseAdmin.ts                 # initialize admin SDK, export admin, firestore, auth, messaging
│  │  ├─ errors.ts                        # shared error types
│  │  └─ validators.ts                    # helper validation functions
│  ├─ utils/
│  │  ├─ sendNotification.ts              # FCM + email wrapper
│  │  ├─ queue.ts                         # simple FIFO helpers for waiting list logic (optional)
│  │  └─ time.ts                          # timezone helpers, rounding utilities
│  ├─ middleware/
│  │  ├─ authGuard.ts                     # verify callable auth, return role info
│  │  └─ rateLimiter.ts                   # basic throttling for public endpoints
│  ├─ auth/
│  │  ├─ onStudentSignup.ts               # auth.onCreate -> create user doc
│  │  ├─ onUserDelete.ts                  # auth.onDelete -> cleanup docs
│  │  └─ manageClaims.ts                  # admin callable to set custom claims (admin-only)
│  ├─ registration/
│  │  ├─ libraryRegistrationRequest.ts    # http/callable: public request -> write library_registration_requests
│  │  ├─ approveLibrary.ts                # callable by admin to approve & create manager user + claims
│  │  └─ rejectLibrary.ts                 # callable by admin to reject with reason
│  ├─ booking/
│  │  ├─ applyForLibrarySeat.ts           # callable: create student_registration_requests
│  │  ├─ managerApproveSeat.ts            # callable: manager approves student
│  │  ├─ autoAssignSeat.ts                # Firestore trigger or callable for single-seat assignment
│  │  └─ transferSeatOnCheckout.ts        # Firestore trigger: on checkout -> assign waiting list
│  ├─ subscriptions/
│  │  ├─ createSubscription.ts            # callable: Manager creates SaaS subscription
│  │  ├─ handlePaymentWebhook.ts          # http: Listens for webhooks from payment provider
│  │  ├─ onSubscriptionStatusChange.ts    # trigger: Denormalizes status to LIBRARIES collection
│  │  └─ checkExpiredSubscriptions.ts     # scheduled: Nightly check for expired subscriptions
│  ├─ waiting/
│  │  ├─ addToWaitingList.ts              # helper callable (or used by applyForLibrarySeat)
│  │  ├─ waitingListExpiryHandler.ts      # scheduled cleanup for expired wait entries
│  │  └─ confirmWaitingAssignment.ts      # callable: student confirms assigned seat (30-min window)
│  ├─ attendance/
│  │  ├─ checkInStudent.ts                # callable: create attendance_logs entry
│  │  ├─ checkOutStudent.ts               # callable: close attendance, calculate duration
│  │  ├─ overOccupancyMonitor.ts          # scheduled (every 15 min): detect & handle over-occupancy
│  │  └─ reconcileAttendance.ts           # daily cron: reconcile orphan sessions / quota accounting
│  ├─ payments/
│  │  ├─ recordPayment.ts                 # callable: student posts payment
│  │  ├─ confirmPayment.ts                # callable: manager confirms payment
│  │  └─ paymentCleanup.ts                # scheduled job to notify unconfirmed payments older than X days
│  ├─ reports/
│  │  ├─ dailySeatAllocator.ts            # scheduled 5 AM: pre-allocate seats for day
│  │  ├─ dailyQuotaMonitor.ts             # scheduled midnight: quota warnings
│  │  └─ dailyReportGenerator.ts          # scheduled midnight: generate & store reports
│  ├─ admin/
│  │  ├─ assignVerificationAgent.ts       # admin callable to assign agents to libraries
│  │  └─ auditLogWriter.ts                # wrapper for server-side-only writes to audit_logs
│  ├─ tests/                              # unit/integration tests using emulator
│  │  ├─ booking.test.ts
│  │  └─ attendance.test.ts
│  └─ types/
│     ├─ index.d.ts                       # TS interfaces for Firestore documents
│     └─ enums.ts                         # enums for status strings etc.
├─ scripts/
│  ├─ deploy.sh                           # convenience deploy script (CI friendly)
│  └─ seed-local.js                       # seed emulator with sample data
├─ .firebaserc
└─ README.md
```

---

## File / Folder Purpose (brief)

- **src/index.ts**
  - Central export file. Import functions from each module and export them as `exports.applyForLibrarySeat = ...` (or `export const applyForLibrarySeat = functions.https.onCall(...)`).

- **src/lib/firebaseAdmin.ts**
  - Single initialization of Admin SDK: `admin.initializeApp()`. Export `admin`, `db`, `auth`, `messaging`, making it re-usable across modules.

- **src/config/index.ts**
  - Loads configuration (from `process.env` or `functions.config()`), validates keys and exposes typed config (e.g., `NOTIFICATION_TOPIC_PREFIX`, `TIMEZONE`).

- **src/middleware/authGuard.ts**
  - Checks `context.auth` in callables, pulls custom claims, enforces role restrictions. Reusable for all callables.

- **src/utils/sendNotification.ts**
  - Encapsulates push + email + Firestore notification creation.

- **auth/**
  - Auth triggers: `onCreate` -> create user document; set default role; notify admin for verification.

- **registration/**
  - Public-facing library registration functions and admin approval routines. `approveLibrary.ts` should create manager auth user (Admin SDK) and set custom claims `role: 'manager', managerLibraryIds: [...]`.

- **booking/** & **waiting/** & **attendance/**
  - Core seat allocation and occupancy logic. Keep domain logic here. `autoAssignSeat.ts` should be callable and also triggered by Firestore `onUpdate` when seats free up.

- **subscriptions/**
  - Handles B2B SaaS billing logic for libraries subscribing to the Ekaant platform.
- **reports/**
  - Scheduled jobs (Cloud Scheduler triggers via `functions.pubsub.schedule('every 24 hours')...`) and report generation.

- **admin/**
  - Admin-only helpers (assign verification agents, write audit logs).

- **tests/**
  - Unit tests using `firebase-functions-test` or `@firebase/rules-unit-testing` + Firestore emulator.

- **scripts/**
  - Useful for CI/CD and local dev.

---

## Naming & Trigger Recommendations

- Use **`onCall`** for functions invoked by authenticated mobile apps where auth context must be available.
- Use **`onRequest`** (HTTP) for public webhooks (e.g., payment gateway later).
- Use **Firestore triggers** (`functions.firestore.document('attendance_logs/{id}').onCreate(...)`) for reactive flows like "seat freed → assign waiting list".
- Use **Pub/Sub schedule** for Cron: `functions.pubsub.schedule('every 24 hours').timeZone('Asia/Kolkata').onRun(...);`

---

## TypeScript / Build Notes

- `package.json` scripts:

  ```json
  {
    "scripts": {
      "build": "tsc",
      "serve": "firebase emulators:start --only functions,firestore",
      "deploy": "firebase deploy --only functions",
      "lint": "eslint --ext .ts src",
      "test": "mocha -r ts-node/register src/tests/**/*.test.ts"
    }
  }
  ```

- Keep `tsconfig.json` target to `ES2019` or later.
- Use `eslint` + `prettier`.
- Use `firebase-functions` v3+ and `firebase-admin` latest.

---

## Security & Best Practices (ops notes)

- All admin-only operations must be callable only by users with `role: admin` in custom claims — set securely with Admin SDK.
- Use **custom claims** for role checks in security rules and in authGuard middleware to avoid additional Firestore reads.
- Write **idempotent** functions (especially scheduled jobs) to avoid double-assignments on retries.
- Use Firestore **transactions** or **batched writes** when assigning seats (read availability → assign seat → update waiting_list) to prevent race conditions.
- For long-running work (e.g., heavy analytics), consider pushing tasks to Pub/Sub / Cloud Tasks from Functions to keep execution time under limits.
- Keep audit logs written only from server-side code (admin module).

---

## Example: index.ts (pattern)

```ts
// src/index.ts
import * as functions from 'firebase-functions';
import { onStudentSignup } from './auth/onStudentSignup';
import { libraryRegistrationRequest } from './registration/libraryRegistrationRequest';
import { approveLibrary } from './registration/approveLibrary';
import { applyForLibrarySeat } from './booking/applyForLibrarySeat';
import { checkInStudent } from './attendance/checkInStudent';
import { checkOutStudent } from './attendance/checkOutStudent';
import { dailySeatAllocator } from './reports/dailySeatAllocator';

// Auth triggers
export const authOnCreate = functions.auth.user().onCreate(onStudentSignup);

// HTTP / Callable
export const httpLibraryRegistration = functions.https.onCall(libraryRegistrationRequest);
export const httpApproveLibrary = functions.https.onCall(approveLibrary);
export const httpApplyForSeat = functions.https.onCall(applyForLibrarySeat);
export const httpCheckIn = functions.https.onCall(checkInStudent);
export const httpCheckOut = functions.https.onCall(checkOutStudent);

// Scheduled jobs
export const scheduledDailySeatAllocator = functions.pubsub
  .schedule('0 5 * * *') // 5:00 AM Asia/Kolkata
  .timeZone('Asia/Kolkata')
  .onRun(dailySeatAllocator);
```

---

# Functions list : ✅ **When to Use Which Firebase Function Type (Ekaant Architecture Guide)**

Here is a **precise, goal-driven list** of when to use which Firebase Function type in **Ekaant**, written in a clean 1-liner format for quick reference and developer handover.

---

## 🔵 **1. `onCall()` (Callable Functions) – _For authenticated app actions_**

Use when the **mobile app** is calling backend logic and you need **user authentication** automatically attached.

### When to use:

- **applyForLibrarySeat** → When a student applies for a seat.
- **managerApproveSeat** → When manager approves a student.
- **recordPayment** → When student submits payment info.
- **confirmPayment** → When manager confirms payment.
- **checkInStudent** → Student marks attendance start.
- **checkOutStudent** → Student ends attendance session.
- **confirmWaitingListSeat** → Student accepts waiting list assignment.
- **cancelWaitingListRequest** → Student cancels from waiting list.
- **updateUserProfile** → Student updates profile safely.
- **adminApproveLibrary** → Admin approves new library and sets custom claims.
- **createSubscription** → Manager subscribes library to a SaaS plan.

👉 **Best for Ekaant:** All authenticated app transactions.
👉 `context.auth` checks are built-in → safer than `onRequest`.

---

## 🔴 **2. `onRequest()` (HTTP API Endpoint) – _For external/public/SaaS style calls_**

Use when the request comes from **outside the app**, without Firebase Auth, or when you need **REST API-like behavior**.

### When to use:

- **Library registration public form submission**
- **handlePaymentWebhook** → Receiving webhooks from payment provider (Stripe, Razorpay).
- **Admin dashboard endpoints** if built outside Firebase Auth
- **Utility URLs** (e.g., health check endpoint, website integration)

👉 **Best for:** Public forms, webhooks, external systems.
👉 Avoid for app actions—use `onCall()` instead.

---

## 🟣 **3. Firestore Triggers (`onCreate`, `onUpdate`, `onDelete`) – _For automation and reactive backend logic_**

Use when backend logic should run **automatically** whenever Firestore data changes.

### When to use:

- **onStudentSignup** → When Auth creates a new student.
- **onLibraryRegistrationRequest** → Notify admin when a new library applies.
- **onSeatFreedTrigger** → When attendance checkout frees a seat → auto assign waiting list.
- **onSubscriptionStatusChange** → When a library's subscription status changes, update the denormalized `subscriptionStatus` in the LIBRARIES document.
- **invoiceStatusUpdate** (future) → Payment status triggers alerts.
- **updateLibraryMetrics** → Count pending requests, seat usage, etc.

👉 **Best for:** Automated workflows that depend on Firestore changes.
👉 These reduce app-side responsibilities significantly.

---

## 🟢 **4. Scheduled Functions (`pubsub.schedule()`) – _For cron-job style daily automation_**

Use when you need tasks to run **daily, hourly, or at fixed times** automatically.

### When to use:

- **dailySeatAllocator (5:00 AM)** → Pre-assign seats for the day.
- **overOccupancyMonitor (every 15 min)** → Check if students overstayed.
- **dailyQuotaMonitor (midnight)** → Deduct hours, send warnings.
- **waitingListCleanup (every 30 min)** → Remove 30-minute expired waiting entries.
- **dailyReportGenerator (midnight)** → Generate library usage reports.
- **checkExpiredSubscriptions (daily)** → Nightly check for subscriptions that are past due.
- **pendingApprovalsReminder (1/day)** → Nudge managers to review requests.

👉 **Best for:** Anything time-based, recurring, cleanup-related.

---

# 🧠 **Summary (Cheat Sheet You Can Share With Dev Team)**

| Function Type          | When to Use                         | Example in Ekaant                   |
| ---------------------- | ----------------------------------- | ----------------------------------- |
| **onCall()**           | App → backend with auth             | bookings, payments, subscriptions   |
| **onRequest()**        | Public endpoints + external systems | library application, webhooks       |
| **Firestore Triggers** | Auto-run when DB changes            | auto seat assignment, notifications |
| **Scheduled (Cron)**   | Time-based automation               | daily seat allocation, cleanup      |
| **Messaging**          | Sending push alerts                 | all notifications                   |

---

## Architectural TODO

### Migrate File Uploads to a Firebase Function-Mediated Approach

**Current State:** File uploads (for library images, host profile, requirements, etc.) are handled directly by the client-side application. The client's code communicates with Firebase Storage, uploads the file, and gets the download URL.

**Target State:** Implement a more secure and robust architecture where file uploads are mediated by a Firebase Function.

**Proposed Flow:**

1.  **Client Requests Upload:** The client calls a callable Firebase Function (e.g., `getSignedUploadUrl`) with metadata about the file it wishes to upload (e.g., file type, size, associated library ID).
2.  **Server-Side Validation:** The Firebase Function runs comprehensive validation logic:
    - **Authentication & Authorization:** Is the user authenticated and authorized to upload this file for this library?
    - **File Constraints:** Does the file type and size meet the application's requirements?
    - **Business Logic:** Does the user have available upload slots? (e.g., max 10 library photos).
3.  **Generate Signed URL:** If validation passes, the function generates a short-lived, v4 signed URL for a specific path in the Google Cloud Storage bucket.
4.  **Client Uploads:** The function returns the signed URL to the client. The client then uses this URL to upload the file directly and securely to the designated path.
5.  **(Optional) Post-Processing:** An `onFinalize` Cloud Function can be triggered by the file upload to perform post-processing tasks like:
    - Image compression or thumbnail generation.
    - Malware scanning.
    - Updating a Firestore document with the new file URL.

**Benefits:**

- **Enhanced Security:** Storage bucket rules can be locked down to deny all direct client writes, preventing unauthorized uploads. All uploads must be pre-authorized by the validation function.
- **Advanced Validation:** Server-side code allows for more complex validation than Storage Rules alone can provide.
- **Centralized Control:** The logic for what can be uploaded and where is centralized in one secure location.
- **Post-Processing Capabilities:** Enables powerful, server-triggered workflows after an upload completes.

---

## Enhancements & Edge Cases for Robustness

This section documents key architectural decisions and patterns to ensure the backend is secure, robust, and handles potential edge cases correctly.

### 1. Idempotency for Critical Operations

- **Concern:** Functions like `approveLibrary` could be triggered multiple times for the same request, leading to unintended side effects.
- **Solution:** All critical, state-changing callable functions must be idempotent. This will be achieved by using Firestore transactions.
- **Example (`approveLibrary`):** The function will be wrapped in a transaction. The transaction will first read the target document from the `libraryRegistrationRequests` collection and check for a flag (e.g., `status !== 'pending'`). If the request has already been processed, the function will exit gracefully. If not, it will perform the approval logic and update the status, all within the atomic transaction.

### 2. Strict Server-Side Data Validation

- **Concern:** Malformed data from the client could corrupt the database or cause unexpected function crashes.
- **Solution:** Every callable function must treat all incoming data as untrusted. A validation layer will be the first step in each function's execution. We will use a library like `zod` to define schemas for the expected `data` payload and validate the input against them. If validation fails, the function will throw a specific `functions.https.HttpsError` with an `'invalid-argument'` code.

### 3. Development & Staging Environment Setup

- **Admin Creation:** While the production `admin` user will be set manually in the Firebase Console, a utility script (`scripts/set-admin.js`) will be created for development and testing purposes. This will allow developers to easily grant admin privileges to any user in the local emulator environment, streamlining the development workflow.
