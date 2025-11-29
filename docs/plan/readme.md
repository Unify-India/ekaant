An MVP (Minimum Viable Product) story for "Ekaant" focusing solely on the Indian market, incorporating your specified features, 3-role login, and the Ionic/Angular/Firebase/Capacitor tech stack.

The goal of this MVP is to validate the core concept of connecting students with study spaces and addressing the slot management issue, while establishing the foundational elements for future growth.

---

## Ekaant: MVP User Stories (India Only)

**Tech Stack:** Ionic (Angular), Firebase (Firestore, Authentication, Storage, Cloud Functions), Capacitor

---

### **General MVP Principles:**

- **Focus on Core Flow:** Prioritize the essential steps for library registration, student booking, and initial admin oversight.
- **Manual Processes Where Needed:** Some advanced automation (e.g., complex payment reminders, detailed analytics) might be manual or simplified in MVP.
- **Trust and Verification:** Emphasize the importance of identity verification for both libraries and students for safety and authenticity.

---

### **1. Public Page & Shared Elements**

**Goal:** Establish a common entry point and introduce the platform.

- **Common Login Page:**
  - **User Story (Public):** "As a potential user, I want a single, clear login page where I can choose to sign in as a Student, Library Manager, or Admin so I can access my respective account."
  - **Tech Notes:** Ionic routes for different login forms. Firebase Authentication for email/password.
- **About Us Page:**
  - **User Story (Public):** "As a potential user, I want to understand what 'Ekaant' is and its benefits (e.g., finding quiet study spaces, monetizing unused slots) so I can decide if it's right for me."
  - **Tech Notes:** Static Ionic page.
- **Help/Support/Feedback Page (Pre-Login - Placeholder):**
  - **User Story (Public):** "As a visitor, I want to see that there's a way to get help or provide feedback, even if I need to log in to submit a request, so I know support is available."
  - **Tech Notes:** Static page initially, directing users to log in for submission.
  - **Anonymous Submission (Post-Login):** "As a logged-in user, I want the option to submit feedback anonymously so I can share my thoughts without revealing my identity."
  - **Tech Notes:** Form with an optional checkbox for "Submit Anonymously." Store user ID but flag as anonymous in Firestore.

---

### **2. Library Manager Role**

**Goal:** Enable libraries to register, set up their profiles, and manage student registrations.

**Firebase Components:** Authentication, Firestore, Storage (for logo), Cloud Functions.

- **1. Register Library (Public Form - Initial Request):**
  - **User Story (Library Owner):** "As a library owner, I want to **register my library's basic details** (name, number of seats, map location URL, owner details like GST number/Pan Card/Aadhaar) through a public form so 'Ekaant' can verify my ownership and approve my listing."
  - **Tech Notes:**
    - Public Ionic form accessible without login.
    - Data submitted to a `library_registration_requests` collection in Firestore.
    - Validation for required fields.
    - Firebase Storage for GST/Aadhaar proof upload.
  - **User Story (Library Owner):** "As a library owner, upon successful submission, I want to receive a confirmation that my request is pending Admin approval."
  - **Tech Notes:** Confirmation message on screen, basic email (or in-app notification placeholder for MVP).

- **2. Complete Library Profile (Post-Approval):**
  - **User Story (Library Manager):** "As a library manager, once my library registration is approved by an Admin, I want to **log in using credentials provided** so I can complete my library's profile."
  - **Tech Notes:**
    - Admin creates Firebase Auth user for the manager upon approval.
    - Initial login might redirect to a profile completion page.
  - **User Story (Library Manager):** "As a library manager, I want to **upload my library's logo, define cubicle slot details** (e.g., 6-hour, 12-hour, specific timings), **set pricing** for these slots, and **specify if the library is for Boys, Girls, or Both**."
  - **Tech Notes:**
    - Ionic forms for profile completion.
    - Firebase Storage for logo.
    - Firestore collections: `libraries` (main data), `slots` (sub-collection under library or separate collection with library ID).
  - **User Story (Library Manager):** "As a library manager, I want to **add crucial compliance and safety information** like nearest police station, hospital, and emergency contact numbers so students feel secure."
  - **Tech Notes:** Text fields in the library profile in Firestore.
  - **User Story (Library Manager):** "As a library manager, I want to **see pending student registration requests** for my library so I can review them."
  - **Tech Notes:** Dashboard component fetching `student_registration_requests` from Firestore, filtered by `libraryId` and `status: 'pending'`.
  - **User Story (Library Manager):** "As a library manager, I want to **approve or reject student registration requests** for my library based on seat availability and upon receiving cash payment."
  - **Tech Notes:**
    - UI to view student details and proof.
    - Buttons for "Approve" / "Reject".
    - Firebase Cloud Function triggered on approval to update student's status, add them to `registered_students` list for that library, and possibly send a notification.
    - **Crucial MVP Flow:** Manager physically verifies payment, then marks as approved in the app. No in-app cash payment tracking in MVP, just approval of access.
  - **User Story (Library Manager):** "As a library manager, if there are no seats available, I want to **put a student's registration request into a waiting list** so they can be notified later."
  - **Tech Notes:** Status change to `status: 'waiting_list'` in `student_registration_requests`.

---

### **3. Student Role**

**Goal:** Enable students to sign up, find libraries, register interest, and manage their status.

**Firebase Components:** Authentication, Firestore, Storage (for ID proof), Cloud Functions.

- **1. Signup and Complete Profile with Identity Proof:**
  - **User Story (Student):** "As a new student user, I want to **sign up for an 'Ekaant' account** using my email and password so I can access the app's features."
  - **Tech Notes:** Firebase Authentication for user creation.
  - **User Story (Student):** "As a new student user, I want to **complete my profile details** (Name, Contact, Gender, Address) and **upload an identity proof** (Aadhaar/Student ID) so my account can be verified for library access."
  - **Tech Notes:**
    - Ionic form for profile data.
    - Firebase Storage for ID proof image.
    - Data saved to `students` collection in Firestore.
    - **Important:** Student status initially set to `unverified`.

- **2. Browse Library Nearby:**
  - **User Story (Student):** "As a student, I want to **browse a list of libraries** available on 'Ekaant' by entering my PIN code or city name so I can find a suitable study space near me."
  - **Tech Notes:**
    - Ionic input field for PIN code/city.
    - Firestore query on `libraries` collection based on location fields.
    - Display list of basic library info (name, location, available seats count).

- **3. Check Details of Library and Apply for Library:**
  - **User Story (Student):** "As a student, I want to **view detailed information about a specific library** (logo, full address, available slot timings & pricing, compliance info, gender restrictions) before applying so I can make an informed decision."
  - **Tech Notes:** Dynamic Ionic page displaying data from the selected library's Firestore document.
  - **User Story (Student):** "As a student, I want to **apply to register at a library** after checking its details, and my application should be sent to the Library Manager for approval."
  - **Tech Notes:**
    - Button to "Apply for Registration."
    - Creates a document in `student_registration_requests` collection with `studentId`, `libraryId`, `status: 'pending'`.
    - Triggers Firebase Cloud Function to notify the respective Library Manager (via email or internal notification if implemented).

- **4. In Case of No Available Seat, It Goes in Waiting:**
  - **User Story (Student):** "As a student, if the library I applied to has no immediate seats, I want my application to **automatically go into a waiting list** so I can be considered when a seat becomes available."
  - **Tech Notes:** As described in Manager role, the Manager sets the status to `waiting_list`. Student can see their application status in their dashboard.

---

### **4. Admin Role**

**Goal:** Oversee platform operations, verify libraries, and provide support.

**Firebase Components:** Authentication, Firestore, Cloud Functions.

- **1. Signup (Manual/Invitation Only for MVP):**
  - **User Story (Admin):** "As an administrator, I want to **log in to the 'Ekaant' platform** to manage library requests and users."
  - **Tech Notes:** Initial admin user created manually in Firebase Authentication. No public signup for admin.
- **2. See Library List and New Request for Registration:**
  - **User Story (Admin):** "As an administrator, I want to **view a dashboard of all registered libraries** and easily **see new library registration requests** (from the public form) so I can process them."
  - **Tech Notes:** Admin Ionic dashboard fetching data from `libraries` and `library_registration_requests` collections. Filtering by `status: 'pending'`.
- **3. After Verification of Details, Admin Approves the Library:**
  - **User Story (Admin):** "As an administrator, after reviewing the submitted library details and proof of ownership, I want to be able to **approve or reject the library registration request**."
  - **Tech Notes:**
    - UI to view submitted details and uploaded proof.
    - Buttons to "Approve" / "Reject".
    - Firebase Cloud Function triggered on approval:
      - Moves data from `library_registration_requests` to `libraries` collection (or updates status in existing doc).
      - Creates a new Firebase Authentication user account for the Library Manager (with temporary password, sent via email).
      - Updates the library's status to `approved`.
      - Sends an email to the Library Manager with login credentials.
- **4. Feedback, Support/Query or Help Page to See Request by End Users:**
  - **User Story (Admin):** "As an administrator, I want to **view all submitted feedback/support requests** from students and managers so I can address their queries or issues."
  - **Tech Notes:** Admin Ionic page fetching data from a `feedback_support` collection in Firestore. Initially, this is a basic list view.

---

### **Firebase Specific Considerations for MVP:**

- **Firestore Data Model:**
  - `users` (root collection for all users, with `role` field: 'student', 'manager', 'admin')
  - `students` (details, ID proof reference, `verification_status`)
  - `libraries` (details, logo URL, `status: 'pending'/'approved'`)
  - `library_registration_requests` (temp collection for public submissions)
  - `student_registration_requests` (student applies to a library, `status: 'pending'/'approved'/'waiting_list'`)
  - `feedback_support` (messages from users, with `is_anonymous` flag)
- **Firebase Authentication:** Used for all user logins.
- **Firebase Storage:** For profile pictures, identity proofs, library logos.
- **Firebase Cloud Functions:**
  - `onLibraryRegistrationApprove`: Triggered by Admin approval, creates manager user, updates library status, sends email.
  - `onStudentRegistrationApprove`: Triggered by Manager approval, updates student status for that library, sends notification.
  - Potentially for sending emails/notifications.
- **Security Rules (Firestore/Storage):** Crucial for defining who can read/write what data based on user roles and UIDs. For example, a student can only read their own `student` document and `student_registration_requests` related to them, but all libraries can be browsed. Managers can only modify their own library data and process requests for their library.

---

This MVP plan provides a solid foundation for "Ekaant," allowing you to validate the core concept and user flows before building out more advanced features like the detailed slot management (no-shows, hourly booking) and full payment tracking.
