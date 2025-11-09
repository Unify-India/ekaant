# Ekaant Project Ideation & MVP Summary

**Ekaant** is a mobile-first platform designed to streamline library management, focusing on self-study cubicles and book lending in the Indian market. Its unique selling proposition (USP) is enabling **libraries to monetize cubicle slots that are booked but unused (no-shows)**, converting idle space into additional revenue.

## 1. Architecture and Technology Stack

The application is being built on a modern, robust, and scalable full-stack solution suitable for rapid development and eventual deployment to native mobile platforms.

| Component | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend/UI** | **Ionic** (with Angular) | Provides a single codebase for web, iOS, and Android applications, ensuring a consistent and responsive user experience. |
| **Backend/DB** | **Firebase** | Used for all backend services: **Firestore** (NoSQL Database), **Authentication**, **Storage** (for ID proofs/logos), and **Cloud Functions** (for business logic/automation). |
| **Native Build** | **Capacitor** | Wraps the web application into native mobile containers for distribution on the Google Play Store and Apple App Store. |

---

## 2. User Roles and Responsibilities

The MVP utilizes three distinct user roles, each with segmented access and capabilities essential for the platform's operation.

| User Role | Core Responsibility | Key Actions (MVP) |
| :--- | :--- | :--- |
| **Student** | The end user seeking quiet, focused study spaces. | **Sign Up & Profile Vetting:** Complete profile with ID proof. **Browse & Apply:** Discover nearby libraries and submit registration applications. **Status Check:** View application/waitlist status. |
| **Library Manager** | Owner/operator of a library; responsible for physical space management and student verification. | **Initial Library Registration:** Complete detailed profile (slots, pricing, safety info) post-Admin approval. **Student Approval:** Manually approve/reject student registration applications upon cash payment verification. **Waitlist Management:** Manually mark student applications as 'Waiting List'. |
| **Admin** | System operator and platform gatekeeper; responsible for ensuring library and user authenticity. | **Vetting Libraries:** Review public library registration requests and approve/reject based on verification. **User Oversight:** Manage and approve Manager credentials. **Support:** View and manage user feedback/support requests. |

---

## 3. Project Feature List (MVP & Future)

This table outlines the features prioritized for the MVP to establish the core workflow, and the features planned for future phases to deliver the unique value proposition.

| Feature Category | MVP Scope | Implementation Status | Future Scope |
| :--- | :--- | :--- | :--- |
| **User Onboarding & Access** | 3-Role Login. Student & Manager basic signup/registration. Admin approval for Manager access. | **Implemented.** `AuthService` handles role-based login (including social) and registration flows. Guards for each role are in place. | Automated password reset and two-factor authentication (2FA). |
| **Library Registration** | Public form for basic details. Admin reviews and approves. Manager completes a detailed profile post-approval. | **Implemented.** A comprehensive, multi-step registration form exists at `pages/library-registration-form`. | Dynamic map integration for accurate location pins. Templatized slot configurations. |
| **Student Registration** | Student sign up, identity proof upload, submission of application to a library. Manager manually approves/rejects. | **Partially Implemented.** Student signup and profile pages exist. Application form is created. Manager approval UI is a placeholder. | Automated student verification (e.g., OTP/DigiLocker integration). |
| **Slot Management (USP)** | **Manual Approval:** Manager checks physical seat availability and payment (cash) before approving student access. | **Not Implemented.** | **Automated No-Show Detection:** System flags booked cubicles as 'available' after a grace period (e.g., 15 mins). **Hourly Re-Monetization:** Released slots are automatically advertised for hourly, short-term booking. **Cubicle Check-in/out:** QR code or staff-driven logging of physical presence. |
| **Waiting List** | Student's application status is set to `waiting_list` by the Manager if seats are full. Student views status. | **Not Implemented.** | Automated notification and timed claim system. |
| **Payments** | Manager records cash payment received. Basic Payment History tracking for the Manager. | **Partially Implemented.** `manager/payment-history` page created as a placeholder for recording payments. `student/payments` page exists to view history. No backend logic yet. | Detailed transaction logging, recurring fee reminders, automated late fee calculation. |
| **Support & Feedback** | **Basic Form:** Logged-in users can submit queries/feedback. Admin views the list. | **Partially Implemented.** `pages/support` page exists. `admin/user-feedback` page is a placeholder. | Manager-level ticket assignment and status updates. |
| **Book Lending** | *Out of MVP Scope* | **Not Implemented.** | Book inventory management, Issue/Return tracking, Student book search. |

---

## 4. Pages and Views Analysis

The following pages cover the user experience and administrative workflow.

### Public Pages

| Page | Purpose | Status & Path |
| :--- | :--- | :--- |
| **Landing Page** | The attractive entry page, marketing the app's value. | **Implemented.** `pages/home/home.page.ts` |
| **Login** | Common login screen for all roles. | **Implemented.** `auth/login/login.page.ts` |
| **Signup** | Student sign-up form. | **Implemented.** `student/signup/signup.page.ts` |
| **Register Library** | Initial public form for Library Owners. | **Implemented.** `pages/register-library/register-library.page.ts` |
| **Library Registration Form**| The detailed, multi-step form for owners. | **Implemented.** `pages/library-registration-form/library-registration-form.page.ts` |
| **Browse Libraries** | Search and list libraries. | **Implemented.** `pages/browse-libraries/browse-libraries.page.ts` |
| **Library Details** | Detailed view of a specific library. | **Implemented.** `pages/library-details/library-details.page.ts` |
| **About Us** | Static page explaining the platform. | **Implemented.** `pages/about-us/about-us.page.ts` |
| **Support** | Page for users to submit support tickets. | **Implemented.** `pages/support/support.page.ts` |
| **Pricing** | Displays the platform's pricing plans. | **Implemented.** `pages/pricing/pricing.page.ts` |
| **Privacy Policy** | Displays the privacy policy. | **Implemented.** `pages/privacy-policy/privacy-policy.page.ts` |
| **Delete Account** | Page for account deletion instructions. | **Implemented.** `pages/delete-account/delete-account.page.ts` |

### Student Pages

| Page | Purpose | Status & Path |
| :--- | :--- | :--- |
| **Dashboard** | Main student view: Shows application status, seat assignment. | **Implemented.** `student/dashboard/dashboard.page.ts` |
| **Profile** | Student profile completion and identity proof upload. | **Implemented.** `student/profile/profile.page.ts` |
| **Apply for Library** | Form to submit the registration application. | **Implemented.** `pages/application-form/application-form.page.ts` |
| **My Bookings** | View and manage personal bookings. | **Placeholder.** `student/my-bookings/my-bookings.page.ts` |
| **Payments** | View payment history. | **Implemented.** `student/payments/payments.page.ts` |

### Manager Pages

| Page | Purpose | Status & Path |
| :--- | :--- | :--- |
| **Dashboard** | Overview of status, pending requests, and occupancy. | **Placeholder.** `manager/dashboard/dashboard.page.ts` |
| **Complete Profile** | Form to set up slots, pricing, etc., after Admin approval. | **Placeholder.** `manager/complete-profile/complete-profile.page.ts` |
| **Student Applications** | List of all pending student registration requests. | **Placeholder.** `manager/student-applications/student-applications.page.ts` |
| **Student Application Detail**| Detail view to verify and approve/reject applications. | **Placeholder.** `manager/student-application-detail/student-application-detail.page.ts` |
| **Payment History** | View and record student payments. | **Placeholder.** `manager/payment-history/payment-history.page.ts` |
| **Slot Management** | Manage library seats and slots. | **Placeholder.** `manager/slot-management/slot-management.page.ts` |
| **Performance Report** | View library performance metrics. | **Placeholder.** `manager/performance-report/performance-report.page.ts` |

### Admin Pages

| Page | Purpose | Status & Path |
| :--- | :--- | :--- |
| **Admin Login** | Separate, secure login for administrators. | **Implemented.** `admin/admin-login/admin-login.page.ts` |
| **Dashboard** | System oversight, quick stats on libraries and users. | **Placeholder.** `admin/dashboard/dashboard.page.ts` |
| **Library Requests** | List of new library registration requests for review. | **Placeholder.** `admin/library-requests/library-requests.page.ts` |
| **Library Request Detail** | Detail view to approve/reject a library registration. | **Placeholder.** `admin/library-request-detail/library-request-detail.page.ts` |
| **User Feedback** | View and manage submitted support tickets. | **Placeholder.** `admin/user-feedback/user-feedback.page.ts` |
| **Library Management** | View and manage all approved libraries. | **Placeholder.** `admin/library-management/library-management.page.ts` |
| **User Management** | View and manage all users on the platform. | **Placeholder.** `admin/user-management/user-management.page.ts` |

---

## 5. Shared Components

A number of reusable components have been created to ensure a consistent UI across the application.

| Component | Purpose | Status & Path |
| :--- | :--- | :--- |
| **Amenities Card** | Displays a single amenity with an icon and availability status. | **Implemented.** `components/amenities-card/amenities-card.component.ts` |
| **Attendance Card** | Renders a timeline of student attendance records. | **Implemented.** `components/attendance-card/attendance-card.component.ts` |
| **Library Card** | A card for displaying summary info of a library in a list. | **Implemented.** `components/library-card/library-card.component.ts` |
| **Price Card** | Displays details for a single pricing plan. | **Implemented.** `components/price-card/price-card.component.ts` |
| **Review Card** | Displays user reviews with ratings, tags, and comments. | **Implemented.** `components/review-card/review-card.component.ts` |
| **Requirements List** | Shows a list of requirements for joining a library. | **Implemented.** `components/requirements-list/requirements-list.component.ts` |
| **Report Absence** | A modal component for students to report an absence. | **Implemented.** `student/components/report-absence/report-absence.component.ts` |
| **Cubicle Card** | Placeholder for displaying individual cubicle info. | **Placeholder.** `components/cubicle-card/cubicle-card.component.ts` |
| **Image Uploader** | Placeholder for a generic image upload component. | **Placeholder.** `components/image-uploader/image-uploader.component.ts` |

---

## 6. Brainstorming & Future Enhancements

### No-Show Monetization (USP)
This is the project's killer feature. When ready to move beyond the MVP, here is a potential user flow to consider:

*   **Student:** On their dashboard, a student with a booking could have a "Release My Seat for Today" button. Tapping it could offer them a small credit or reward (e.g., a 5% discount on their next month's fee) to incentivize participation.
*   **System (Backend):** A Cloud Function (`onSeatReleased`) triggers, marks the seat as "Available for Hourly Booking," and notifies the top students on the waiting list.
*   **New/Waiting Student:** These students see the hourly slot on the `browse-libraries` page and can book it instantly, perhaps with a simple, one-click "Book for 1 Hour" button.

### Enhanced Manager Analytics
To make the platform indispensable for library managers, their dashboard could be enhanced with more analytics:

*   **Peak Hour Analysis:** A simple bar chart showing the busiest hours of the day/week.
*   **Revenue per Seat:** A metric showing which seats are the most and least profitable.
*   **Student Attendance Rate:** A percentage showing how often registered students actually check in.

### Student Gamification
To improve student engagement and retention, simple achievements or badges could be introduced:

*   **Perfect Attendance:** Awarded for checking in every day for a month.
*   **Early Bird:** Awarded for checking in before 8 AM.
*   **Community Helper:** Awarded for consistently releasing their seat when absent.

---

## 7. Pending MVP Features by Role

Here is a list of pending features for the MVP, broken down by user role. We can tackle these one by one.

### Admin

| Feature | User Story | Status |
| :--- | :--- | :--- |
| **Approve Libraries** | As an admin, I want to review new library registration requests and approve or reject them. | **Pending.** The UI at `admin/library-requests` is a placeholder. Backend logic is needed. |
| **Manage Feedback** | As an admin, I want to view, categorize, and manage all feedback submitted by users. | **Pending.** The UI at `admin/user-feedback` is a placeholder. |

### Library Manager

| Feature | User Story | Status |
| :--- | :--- | :--- |
| **Approve Students** | As a manager, I want to view a list of student applications and approve or reject them. | **Pending.** The UI at `manager/student-applications` is a placeholder. |
| **Record Cash Payment** | As a manager, I want to select a student and record that they have paid their fee in cash. | **Pending.** The UI at `manager/payment-history` is a placeholder and needs to be built out. |
| **Manage Waitlist** | As a manager, I want to be able to change a student's application status to "Waiting List". | **Pending.** This is part of the student approval flow that needs to be implemented. |
| **Complete Profile** | As a manager, I want to log in and complete my library's detailed profile after being approved by an admin. | **Pending.** The UI at `manager/complete-profile` is a placeholder. |

### Student

| Feature | User Story | Status |
| :--- | :--- | :--- |
| **View Application Status** | As a student, I want to see the real-time status of my library application (Pending, Approved, Waitlisted) on my dashboard. | **Pending.** The dashboard UI exists, but it needs to be connected to Firestore data. |